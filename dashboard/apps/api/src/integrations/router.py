from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .schemas import (
    ConnectRequest,
    ConnectResponse,
    IntegrationDetail,
    IntegrationListResponse,
    SyncResponse,
    TestConnectionResponse,
    WorkspaceReadiness,
)
from .services.integration_service import (
    connect_integration,
    disconnect_integration,
    get_integration_detail,
    get_integrations,
    get_workspace_readiness,
    sync_integration,
    test_integration,
)

router = APIRouter()


@router.get("/integrations", response_model=IntegrationListResponse)
async def list_integrations(db: AsyncSession = Depends(get_db)):
    return await get_integrations(db)


@router.get("/integrations/{provider_id}", response_model=IntegrationDetail)
async def get_integration(provider_id: str, db: AsyncSession = Depends(get_db)):
    result = await get_integration_detail(provider_id, db)
    if not result:
        raise HTTPException(status_code=404, detail=f"Integration '{provider_id}' not found")
    return result


@router.post("/integrations/{provider_id}/connect", response_model=ConnectResponse)
async def connect(provider_id: str, body: ConnectRequest, db: AsyncSession = Depends(get_db)):
    return await connect_integration(provider_id, body.credentials, body.config, db)


@router.post("/integrations/{provider_id}/disconnect", response_model=ConnectResponse)
async def disconnect(provider_id: str, db: AsyncSession = Depends(get_db)):
    return await disconnect_integration(provider_id, db)


@router.post("/integrations/{provider_id}/test", response_model=TestConnectionResponse)
async def test(provider_id: str, body: ConnectRequest, db: AsyncSession = Depends(get_db)):
    return await test_integration(provider_id, body.credentials)


@router.post("/integrations/{provider_id}/sync", response_model=SyncResponse)
async def sync(provider_id: str, db: AsyncSession = Depends(get_db)):
    return await sync_integration(provider_id, db)


@router.get("/workspace-readiness", response_model=WorkspaceReadiness)
async def workspace_readiness(db: AsyncSession = Depends(get_db)):
    return await get_workspace_readiness(db)
