from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/clusters")
async def list_clusters():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/nodes")
async def list_nodes():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/pods")
async def list_pods():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/deployments")
async def list_deployments():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/services")
async def list_services():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/namespaces")
async def list_namespaces():
    raise HTTPException(status_code=501, detail="Not implemented")
