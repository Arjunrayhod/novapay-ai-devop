from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/containers")
async def list_containers():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/containers/{container_id}")
async def get_container(container_id: str):
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/images")
async def list_images():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/info")
async def docker_info():
    raise HTTPException(status_code=501, detail="Not implemented")
