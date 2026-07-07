from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/workspaces")
async def list_workspaces():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/runs")
async def list_runs():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/state")
async def get_state():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/resources")
async def list_resources():
    raise HTTPException(status_code=501, detail="Not implemented")
