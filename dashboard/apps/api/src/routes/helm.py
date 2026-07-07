from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/releases")
async def list_releases():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/releases/{release_name}")
async def get_release(release_name: str):
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/repos")
async def list_repos():
    raise HTTPException(status_code=501, detail="Not implemented")
