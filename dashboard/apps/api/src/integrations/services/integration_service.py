import json
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..base import BaseIntegrationProvider
from ..models import IntegrationCredential
from ..providers import get_provider, list_providers, list_providers_by_category
from ..schemas import (
    ConnectResponse,
    ConnectionStatus,
    IntegrationDetail,
    IntegrationListResponse,
    IntegrationStatus,
    ProviderMeta as ProviderMetaSchema,
    SyncResponse,
    TestConnectionResponse,
    WorkspaceReadiness,
)
from ...utils.encryption import decrypt_token, encrypt_token


def _provider_to_schema(p: BaseIntegrationProvider) -> ProviderMetaSchema:
    m = p.meta
    return ProviderMetaSchema(
        id=m.id,
        name=m.name,
        category=m.category,
        description=m.description,
        icon=m.icon,
        version=m.version,
        docs_url=m.docs_url,
    )


def _cred_to_status(cred: IntegrationCredential) -> IntegrationStatus:
    return IntegrationStatus(
        provider=cred.provider,
        connected=cred.connected,
        status=ConnectionStatus(cred.status)
        if cred.status in {s.value for s in ConnectionStatus}
        else ConnectionStatus.disconnected,
        health=ConnectionStatus.connected if cred.connected else ConnectionStatus.disconnected,
        version=cred.version or "—",
        last_sync=cred.last_sync,
        last_error=cred.last_error,
    )


async def get_integrations(db: AsyncSession) -> IntegrationListResponse:
    result = await db.execute(select(IntegrationCredential))
    stored = {r.provider: r for r in result.scalars().all()}

    details: list[IntegrationDetail] = []
    status_list: list[IntegrationStatus] = []

    for provider in list_providers():
        pid = provider.meta.id
        cred = stored.get(pid)
        if cred and cred.connected:
            decrypted = json.loads(decrypt_token(cred.encrypted_credentials))
            masked = provider.mask_credentials(decrypted)
            status = _cred_to_status(cred)
        else:
            masked = {}
            status = IntegrationStatus(provider=pid)

        status_list.append(status)
        details.append(
            IntegrationDetail(
                provider=_provider_to_schema(provider),
                connection=status,
                config_fields=provider.config_fields,
                masked_credentials=masked,
            )
        )

    connected_count = sum(1 for s in status_list if s.connected)
    total = len(status_list)
    score = round((connected_count / total) * 100, 1) if total > 0 else 0

    workspace = WorkspaceReadiness(
        total=total,
        connected=connected_count,
        score=score,
        integrations=status_list,
    )

    return IntegrationListResponse(integrations=details, workspace_readiness=workspace)


async def get_integration_detail(provider_id: str, db: AsyncSession) -> Optional[IntegrationDetail]:
    provider = get_provider(provider_id)
    if not provider:
        return None

    result = await db.execute(
        select(IntegrationCredential).where(IntegrationCredential.provider == provider_id)
    )
    cred = result.scalar_one_or_none()

    if cred and cred.connected:
        decrypted = json.loads(decrypt_token(cred.encrypted_credentials))
        masked = provider.mask_credentials(decrypted)
        status = _cred_to_status(cred)
    else:
        masked = {}
        status = IntegrationStatus(provider=provider_id)

    return IntegrationDetail(
        provider=_provider_to_schema(provider),
        connection=status,
        config_fields=provider.config_fields,
        masked_credentials=masked,
    )


async def connect_integration(
    provider_id: str, credentials: dict[str, str], config: dict[str, Any], db: AsyncSession
) -> ConnectResponse:
    provider = get_provider(provider_id)
    if not provider:
        return ConnectResponse(
            provider=provider_id, status=ConnectionStatus.error, message="Unknown provider"
        )

    result = await provider.connect(credentials, config)
    if not result.success:
        return ConnectResponse(
            provider=provider_id, status=ConnectionStatus.error, message=result.message
        )

    encrypted_creds = encrypt_token(json.dumps(credentials))
    encrypted_config = encrypt_token(json.dumps(config))

    stmt = select(IntegrationCredential).where(IntegrationCredential.provider == provider_id)
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        existing.encrypted_credentials = encrypted_creds
        existing.encrypted_config = encrypted_config
        existing.connected = True
        existing.status = "connected"
        existing.version = result.version
        existing.last_error = None
    else:
        cred = IntegrationCredential(
            provider=provider_id,
            encrypted_credentials=encrypted_creds,
            encrypted_config=encrypted_config,
            connected=True,
            status="connected",
            version=result.version,
        )
        db.add(cred)

    await db.commit()

    masked = provider.mask_credentials(credentials)
    return ConnectResponse(
        provider=provider_id,
        status=ConnectionStatus.connected,
        message=result.message,
        masked_credentials=masked,
    )


async def disconnect_integration(provider_id: str, db: AsyncSession) -> ConnectResponse:
    provider = get_provider(provider_id)
    stmt = select(IntegrationCredential).where(IntegrationCredential.provider == provider_id)
    cred = (await db.execute(stmt)).scalar_one_or_none()

    if cred:
        cred.connected = False
        cred.status = "disconnected"
        await db.commit()

    if provider:
        await provider.disconnect()

    return ConnectResponse(
        provider=provider_id, status=ConnectionStatus.disconnected, message="Disconnected"
    )


async def test_integration(provider_id: str, credentials: dict[str, str]) -> TestConnectionResponse:
    provider = get_provider(provider_id)
    if not provider:
        return TestConnectionResponse(
            provider=provider_id, success=False, message="Unknown provider"
        )

    result = await provider.test_connection(credentials)
    return TestConnectionResponse(
        provider=provider_id,
        success=result.success,
        message=result.message,
        latency_ms=result.latency_ms,
    )


async def sync_integration(provider_id: str, db: AsyncSession) -> SyncResponse:
    provider = get_provider(provider_id)
    if not provider:
        return SyncResponse(
            provider=provider_id,
            success=False,
            message="Unknown provider",
            timestamp=datetime.now(timezone.utc),
        )

    stmt = select(IntegrationCredential).where(IntegrationCredential.provider == provider_id)
    cred = (await db.execute(stmt)).scalar_one_or_none()
    if not cred or not cred.connected:
        return SyncResponse(
            provider=provider_id,
            success=False,
            message="Not connected",
            timestamp=datetime.now(timezone.utc),
        )

    decrypted = json.loads(decrypt_token(cred.encrypted_credentials))
    try:
        await provider.sync(decrypted)
        cred.last_sync = datetime.now(timezone.utc)
        await db.commit()
        return SyncResponse(
            provider=provider_id, success=True, message="Sync completed", timestamp=cred.last_sync
        )
    except Exception as e:
        return SyncResponse(
            provider=provider_id,
            success=False,
            message=str(e),
            timestamp=datetime.now(timezone.utc),
        )


async def get_workspace_readiness(db: AsyncSession) -> WorkspaceReadiness:
    result = await db.execute(select(IntegrationCredential))
    stored = {r.provider: r for r in result.scalars().all()}

    status_list: list[IntegrationStatus] = []
    for provider in list_providers():
        pid = provider.meta.id
        cred = stored.get(pid)
        if cred and cred.connected:
            status_list.append(_cred_to_status(cred))
        else:
            status_list.append(IntegrationStatus(provider=pid))

    connected_count = sum(1 for s in status_list if s.connected)
    total = len(status_list)
    score = round((connected_count / total) * 100, 1) if total > 0 else 0

    return WorkspaceReadiness(
        total=total, connected=connected_count, score=score, integrations=status_list
    )
