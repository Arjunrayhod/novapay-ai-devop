import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("github")

from ..database import get_db
from ..models.github_credential import GitHubCredential
from ..models.user import User
from ..settings import settings
from ..utils.auth import get_current_user
from ..utils.encryption import decrypt_token, encrypt_token

router = APIRouter()

GITHUB_API = settings.GITHUB_API_BASE.rstrip("/")


async def _get_user_token(current_user: User, db: AsyncSession) -> str:
    result = await db.execute(
        select(GitHubCredential).where(GitHubCredential.user_id == current_user.id)
    )
    cred = result.scalar_one_or_none()
    if cred is None:
        raise HTTPException(
            status_code=401,
            detail="GitHub not connected. Connect your account in Settings.",
        )
    try:
        return decrypt_token(cred.encrypted_token)
    except Exception as e:
        logger.error("Failed to decrypt token for user %s: %s", current_user.username, e)
        raise HTTPException(
            status_code=500,
            detail="Stored GitHub token is corrupted. Please reconnect your GitHub account.",
        )


async def _get_gh_username(current_user: User, db: AsyncSession) -> str:
    result = await db.execute(
        select(GitHubCredential).where(GitHubCredential.user_id == current_user.id)
    )
    cred = result.scalar_one_or_none()
    if cred is None:
        raise HTTPException(
            status_code=401,
            detail="GitHub not connected. Connect your account in Settings.",
        )
    return cred.github_username


GITHUB_API_VERSION = "2022-11-28"


def _build_headers(token: str) -> dict:
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    }


def _raise_github_error(res: httpx.Response):
    logger.warning("GitHub API %s %s: %s", res.status_code, res.url, res.text[:500])
    if res.status_code == 401:
        raise HTTPException(
            status_code=401,
            detail="Invalid GitHub token. Please check that your Personal Access Token is valid and has the required scopes (repo, read:org).",
        )
    if res.status_code == 403:
        rate_remaining = res.headers.get("X-RateLimit-Remaining", "")
        if rate_remaining == "0":
            reset_epoch = res.headers.get("X-RateLimit-Reset", "0")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "GitHub API rate limit exceeded",
                    "message": f"Rate limit resets at {reset_epoch}",
                    "rate_limit_reset": int(reset_epoch) if reset_epoch.isdigit() else None,
                },
            )
        raise HTTPException(
            status_code=403,
            detail="GitHub API access denied. Your token may lack the required permissions.",
        )
    if res.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="The requested resource was not found on GitHub.",
        )
    if res.status_code == 429:
        reset_epoch = res.headers.get("X-RateLimit-Reset", "0")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "GitHub API rate limit exceeded",
                "message": f"Rate limit resets at {reset_epoch}",
                "rate_limit_reset": int(reset_epoch) if reset_epoch.isdigit() else None,
            },
        )
    raise HTTPException(
        status_code=res.status_code,
        detail=f"GitHub API error (HTTP {res.status_code}). Please try again.",
    )


async def gh_get(path: str, token: str):
    headers = _build_headers(token)
    logger.debug("GET %s%s (token=%.10s...)", GITHUB_API, path, token)
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{GITHUB_API}{path}", headers=headers)
    logger.debug("GitHub response %s: %s", res.status_code, res.text[:200])
    if not res.is_success:
        _raise_github_error(res)
    return res.json()


async def gh_get_raw(path: str, token: str) -> httpx.Response:
    headers = _build_headers(token)
    logger.debug("GET %s%s (token=%.10s...)", GITHUB_API, path, token)
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{GITHUB_API}{path}", headers=headers)
    logger.debug("GitHub response %s: %s", res.status_code, res.text[:200])
    if not res.is_success:
        _raise_github_error(res)
    return res


async def gh_post(path: str, body: dict | None = None, token: str | None = None):
    headers = (
        _build_headers(token)
        if token
        else {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": GITHUB_API_VERSION}
    )
    logger.debug("POST %s%s (token=%.10s...)", GITHUB_API, path, token)
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{GITHUB_API}{path}",
            headers=headers,
            json=body,
        )
    logger.debug("GitHub response %s: %s", res.status_code, res.text[:200])
    if not res.is_success and res.status_code != 204:
        _raise_github_error(res)
    return res


# ─── Connection Management (Personal Mode) ──────────────────


class ConnectionBody(BaseModel):
    github_username: str
    token: str


@router.get("/connection")
async def get_connection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GitHubCredential).where(GitHubCredential.user_id == current_user.id)
    )
    cred = result.scalar_one_or_none()
    if cred is None:
        return {"connected": False}
    return {
        "connected": True,
        "github_username": cred.github_username,
        "created_at": cred.created_at.isoformat(),
        "updated_at": cred.updated_at.isoformat(),
    }


@router.post("/connection/test")
async def test_connection(body: ConnectionBody):
    try:
        data = await gh_get("/user", token=body.token)
        login = data.get("login", "")
        return {"valid": True, "github_username": login}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token or connection failed")


@router.post("/connection")
async def save_connection(
    body: ConnectionBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_data = await gh_get("/user", token=body.token)
        gh_login = user_data.get("login", "")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")

    encrypted = encrypt_token(body.token)

    result = await db.execute(
        select(GitHubCredential).where(GitHubCredential.user_id == current_user.id)
    )
    cred = result.scalar_one_or_none()

    if cred:
        cred.github_username = gh_login
        cred.encrypted_token = encrypted
    else:
        cred = GitHubCredential(
            user_id=current_user.id,
            github_username=gh_login,
            encrypted_token=encrypted,
        )
        db.add(cred)

    await db.commit()
    return {"connected": True, "github_username": gh_login}


@router.delete("/connection")
async def delete_connection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GitHubCredential).where(GitHubCredential.user_id == current_user.id)
    )
    cred = result.scalar_one_or_none()
    if cred:
        await db.delete(cred)
        await db.commit()
    return {"connected": False}


@router.post("/connection/refresh")
async def refresh_connection(
    body: ConnectionBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await save_connection(body, current_user, db)


# ─── Repos ───────────────────────────────────────────────────


@router.get("/repos")
async def list_repos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    data = await gh_get("/user/repos?per_page=30&sort=updated", token=token)
    return [
        {
            "name": r["name"],
            "full_name": r["full_name"],
            "owner": {
                "login": r["owner"]["login"],
                "avatar_url": r["owner"]["avatar_url"],
                "html_url": r["owner"]["html_url"],
            },
            "description": r.get("description") or "",
            "private": r["private"],
            "html_url": r["html_url"],
            "default_branch": r["default_branch"],
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "watchers_count": r.get("watchers_count", 0),
            "open_issues_count": r.get("open_issues_count", 0),
            "size": r.get("size", 0),
            "license": (
                {"spdx_id": r["license"]["spdx_id"], "name": r["license"]["name"]}
                if r.get("license")
                else None
            ),
            "created_at": r.get("created_at", ""),
            "updated_at": r.get("updated_at", ""),
            "pushed_at": r.get("pushed_at", ""),
        }
        for r in data
    ]


# ─── Workflows ──────────────────────────────────────────────


@router.get("/workflows")
async def list_workflows(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    gh_owner = await _get_gh_username(current_user, db)
    gh_repo = settings.GITHUB_REPO
    data = await gh_get(f"/repos/{gh_owner}/{gh_repo}/actions/workflows?per_page=50", token=token)
    return [
        {"id": w["id"], "name": w["name"], "path": w["path"], "state": w["state"]}
        for w in data.get("workflows", [])
    ]


class DispatchBody(BaseModel):
    ref: str = "main"
    inputs: dict = {}
    repo: str = ""


@router.post("/workflows/{workflow_id}/dispatch")
async def dispatch_workflow(
    workflow_id: int,
    body: DispatchBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    repo_full = body.repo or f"{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}"
    res = await gh_post(
        f"/repos/{repo_full}/actions/workflows/{workflow_id}/dispatches",
        body.model_dump(exclude={"repo"}),
        token=token,
    )
    if res.status_code == 204:
        return {"status": "triggered", "workflow_id": workflow_id, "ref": body.ref}
    raise HTTPException(status_code=500, detail="Failed to trigger workflow")


@router.get("/workflows/runs")
async def list_workflow_runs(
    workflow_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    repo_full = f"{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}"
    path = f"/repos/{repo_full}/actions/runs?per_page=20"
    if workflow_id:
        path += f"&workflow_id={workflow_id}"
    data = await gh_get(path, token=token)
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "status": r["status"],
            "conclusion": r.get("conclusion"),
            "head_branch": r["head_branch"],
            "head_sha": r["head_sha"][:7],
            "html_url": r["html_url"],
            "run_started_at": r["run_started_at"],
            "updated_at": r["updated_at"],
            "actor": {"login": r["actor"]["login"], "avatar_url": r["actor"]["avatar_url"]},
            "workflow_id": r["workflow_id"],
        }
        for r in data.get("workflow_runs", [])
    ]


@router.get("/workflows/runs/{run_id}/jobs")
async def get_run_jobs(
    run_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    repo_full = f"{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}"
    data = await gh_get(f"/repos/{repo_full}/actions/runs/{run_id}/jobs?per_page=50", token=token)
    return [
        {
            "id": j["id"],
            "name": j["name"],
            "status": j["status"],
            "conclusion": j.get("conclusion"),
            "started_at": j.get("started_at"),
            "completed_at": j.get("completed_at"),
            "steps": [
                {
                    "name": s["name"],
                    "status": s["status"],
                    "conclusion": s.get("conclusion"),
                    "number": s["number"],
                }
                for s in j.get("steps", [])
            ],
        }
        for j in data.get("jobs", [])
    ]


# ─── Issues / Pulls ─────────────────────────────────────────


@router.get("/issues")
async def list_issues(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    repo_full = f"{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}"
    data = await gh_get(f"/repos/{repo_full}/issues?state=open&per_page=20", token=token)
    return [
        {
            "number": i["number"],
            "title": i["title"],
            "state": i["state"],
            "html_url": i["html_url"],
            "created_at": i["created_at"],
            "user": {"login": i["user"]["login"], "avatar_url": i["user"]["avatar_url"]},
        }
        for i in data
    ]


@router.get("/pulls")
async def list_pull_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    repo_full = f"{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}"
    data = await gh_get(f"/repos/{repo_full}/pulls?state=open&per_page=20", token=token)
    return [
        {
            "number": pr["number"],
            "title": pr["title"],
            "state": pr["state"],
            "html_url": pr["html_url"],
            "created_at": pr["created_at"],
            "user": {"login": pr["user"]["login"], "avatar_url": pr["user"]["avatar_url"]},
        }
        for pr in data
    ]


# ─── Branches / User repos ──────────────────────────────────


@router.get("/user/repos")
async def list_user_repos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    data = await gh_get("/user/repos?per_page=50&sort=updated", token=token)
    return [
        {
            "name": r["name"],
            "full_name": r["full_name"],
            "owner": {
                "login": r["owner"]["login"],
                "avatar_url": r["owner"]["avatar_url"],
                "html_url": r["owner"]["html_url"],
            },
            "description": r.get("description") or "",
            "private": r["private"],
            "html_url": r["html_url"],
            "default_branch": r["default_branch"],
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "watchers_count": r.get("watchers_count", 0),
            "open_issues_count": r.get("open_issues_count", 0),
            "size": r.get("size", 0),
            "license": (
                {"spdx_id": r["license"]["spdx_id"], "name": r["license"]["name"]}
                if r.get("license")
                else None
            ),
            "created_at": r.get("created_at", ""),
            "updated_at": r.get("updated_at", ""),
            "pushed_at": r.get("pushed_at", ""),
        }
        for r in data
    ]


@router.get("/repos/{owner}/{repo}/branches")
async def list_branches(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    data = await gh_get(f"/repos/{owner}/{repo}/branches?per_page=30", token=token)
    return [
        {"name": b["name"], "default": b.get("name") == "main" or b.get("name") == "master"}
        for b in data
    ]


# ─── Commits ────────────────────────────────────────────────


@router.get("/commits")
async def list_commits(
    owner: str = Query("", description="Repository owner (defaults to connected user)"),
    repo: str = Query("", description="Repository name (defaults to repo from settings)"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    gh_owner = owner or await _get_gh_username(current_user, db)
    gh_repo = repo or settings.GITHUB_REPO
    data = await gh_get(
        f"/repos/{gh_owner}/{gh_repo}/commits?page={page}&per_page={per_page}",
        token=token,
    )
    return [
        {
            "sha": c["sha"],
            "commit": {
                "author": {
                    "name": c["commit"]["author"]["name"],
                    "date": c["commit"]["author"]["date"],
                },
                "message": c["commit"]["message"],
            },
            "author": (
                {
                    "login": c["author"]["login"],
                    "avatar_url": c["author"]["avatar_url"],
                    "html_url": c["author"]["html_url"],
                }
                if c.get("author")
                else None
            ),
        }
        for c in data
    ]


# ─── Releases ───────────────────────────────────────────────


@router.get("/releases")
async def list_releases(
    owner: str = Query("", description="Repository owner (defaults to connected user)"),
    repo: str = Query("", description="Repository name (defaults to repo from settings)"),
    per_page: int = Query(5, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    gh_owner = owner or await _get_gh_username(current_user, db)
    gh_repo = repo or settings.GITHUB_REPO
    data = await gh_get(
        f"/repos/{gh_owner}/{gh_repo}/releases?per_page={per_page}",
        token=token,
    )
    return [
        {
            "tag_name": r["tag_name"],
            "name": r.get("name") or r["tag_name"],
            "body": r.get("body") or "",
            "html_url": r["html_url"],
            "published_at": r["published_at"],
            "assets": [
                {
                    "name": a["name"],
                    "download_count": a["download_count"],
                    "size": a["size"],
                }
                for a in r.get("assets", [])
            ],
            "prerelease": r.get("prerelease", False),
        }
        for r in data
    ]


# ─── Contributors ───────────────────────────────────────────


@router.get("/contributors")
async def list_contributors(
    owner: str = Query("", description="Repository owner (defaults to connected user)"),
    repo: str = Query("", description="Repository name (defaults to repo from settings)"),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = await _get_user_token(current_user, db)
    gh_owner = owner or await _get_gh_username(current_user, db)
    gh_repo = repo or settings.GITHUB_REPO
    data = await gh_get(
        f"/repos/{gh_owner}/{gh_repo}/contributors?per_page={per_page}",
        token=token,
    )
    return [
        {
            "login": c["login"],
            "avatar_url": c["avatar_url"],
            "contributions": c["contributions"],
        }
        for c in data
    ]
