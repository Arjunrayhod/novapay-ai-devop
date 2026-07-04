from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/repos")
async def list_repos():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/workflows")
async def list_workflows():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/workflows/runs")
async def list_workflow_runs():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/issues")
async def list_issues():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/pulls")
async def list_pull_requests():
    raise HTTPException(status_code=501, detail="Not implemented")
