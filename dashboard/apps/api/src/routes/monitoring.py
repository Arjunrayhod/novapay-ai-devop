from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/metrics")
async def get_metrics():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/alerts")
async def list_alerts():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/logs")
async def query_logs():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/traces")
async def query_traces():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/dashboards")
async def list_dashboards():
    raise HTTPException(status_code=501, detail="Not implemented")
