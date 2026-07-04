from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/scanner/status")
async def scanner_status():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/scanner/run")
async def run_scanner():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/config")
async def get_environment_config():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/variables")
async def list_environment_variables():
    raise HTTPException(status_code=501, detail="Not implemented")
