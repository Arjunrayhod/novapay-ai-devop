import json

from ..utils import _run_helm

_helm_available = None
_helm_version = None


def _check_helm() -> None:
    global _helm_available, _helm_version
    if _helm_available is not None:
        return
    try:
        out = _run_helm(["version", "--short"])
        _helm_version = out.strip().lstrip("v")
        _helm_available = True
    except Exception:
        _helm_available = False
        _helm_version = ""


def is_helm_available() -> bool:
    _check_helm()
    return bool(_helm_available)


def get_helm_version() -> str:
    _check_helm()
    return _helm_version or ""


def list_releases(namespace: str = "") -> list[dict]:
    args = ["list", "--output", "json"]
    if namespace:
        args.extend(["--namespace", namespace])
    else:
        args.append("--all-namespaces")
    try:
        out = _run_helm(args)
        data = json.loads(out)
        return [
            {
                "name": r["name"],
                "namespace": r.get("namespace", ""),
                "revision": int(r.get("revision", 0)),
                "chart": r.get("chart", ""),
                "app_version": r.get("app_version", ""),
                "status": r.get("status", ""),
                "updated": r.get("updated", ""),
            }
            for r in data
        ]
    except Exception:
        return []


def get_release(name: str, namespace: str = "") -> dict | None:
    args = ["status", name, "--output", "json"]
    if namespace:
        args.extend(["--namespace", namespace])
    try:
        out = _run_helm(args)
        data = json.loads(out)
        chart_meta = data.get("chart", {})
        return {
            "name": data.get("name", name),
            "namespace": data.get("namespace", namespace),
            "revision": int(data.get("version", 0)),
            "chart": chart_meta.get("metadata", {}).get("name", ""),
            "app_version": data.get("app_version", ""),
            "status": data.get("info", {}).get("status", ""),
            "updated": data.get("info", {}).get("first_deployed", ""),
            "description": data.get("info", {}).get("description", ""),
            "chart_metadata": chart_meta.get("metadata", {}),
        }
    except Exception:
        return None


def get_release_history(name: str, namespace: str = "") -> list[dict]:
    args = ["history", name, "--output", "json"]
    if namespace:
        args.extend(["--namespace", namespace])
    try:
        out = _run_helm(args)
        data = json.loads(out)
        return [
            {
                "revision": int(r.get("revision", 0)),
                "status": r.get("status", ""),
                "description": r.get("description", ""),
                "date": r.get("date", ""),
                "chart": r.get("chart", ""),
                "app_version": r.get("app_version", ""),
            }
            for r in data
        ]
    except Exception:
        return []


def list_charts(repo: str = "") -> list[dict]:
    try:
        args = ["search", "repo", "--output", "json"]
        if repo:
            args.extend(["--filter", f"{repo}/*"])
        out = _run_helm(args)
        data = json.loads(out)
        return [
            {
                "name": r.get("name", ""),
                "version": r.get("version", ""),
                "app_version": r.get("app_version", ""),
                "description": r.get("description", ""),
                "type_field": r.get("type", ""),
                "repo": r.get("repo", ""),
            }
            for r in data
        ]
    except Exception:
        return []


def list_repositories() -> list[dict]:
    try:
        out = _run_helm(["repo", "list", "--output", "json"])
        data = json.loads(out)
        return [
            {
                "name": r.get("name", ""),
                "url": r.get("url", ""),
                "status": r.get("status", ""),
            }
            for r in data
        ]
    except Exception:
        return []


def get_values(release: str, namespace: str = "") -> str:
    args = ["get", "values", release, "--output", "yaml"]
    if namespace:
        args.extend(["--namespace", namespace])
    try:
        return _run_helm(args)
    except Exception:
        return ""


def get_chart_dependencies(chart_ref: str) -> list[dict]:
    args = ["show", "chart", chart_ref]
    try:
        out = _run_helm(args)
        data = json.loads(out)
        deps = data.get("dependencies", [])
        return [
            {
                "name": d.get("name", ""),
                "version": d.get("version", ""),
                "condition": d.get("condition", ""),
                "repository": d.get("repository", ""),
                "enabled": d.get("enabled", True),
            }
            for d in deps
        ]
    except Exception:
        return []


def get_overview() -> dict:
    releases = list_releases()
    repos = list_repositories()
    charts = list_charts()
    namespaces = set(r.get("namespace", "") for r in releases)
    failed = [r for r in releases if r.get("status", "").lower() in ("failed", "pending-rollback")]
    healthy = [r for r in releases if r.get("status", "").lower() == "deployed"]
    return {
        "total_releases": len(releases),
        "healthy_releases": len(healthy),
        "failed_releases": len(failed),
        "namespace_count": len(namespaces),
        "repository_count": len(repos),
        "chart_count": len(charts),
    }
