from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/vulnerabilities")
async def list_vulnerabilities():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/compliance")
async def get_compliance():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/policies")
async def list_policies():
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/audit-log")
async def get_audit_log():
    raise HTTPException(status_code=501, detail="Not implemented")
