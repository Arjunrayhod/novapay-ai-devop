from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class ConnectionStatus(str, Enum):
    connected = "connected"
    disconnected = "disconnected"
    error = "error"
    warning = "warning"
    unknown = "unknown"


class HealthStatus(str, Enum):
    connected = "connected"
    disconnected = "disconnected"
    error = "error"
    warning = "warning"
    unknown = "unknown"


class ProviderMeta(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str
    version: str = "—"
    docs_url: str = ""


class IntegrationStatus(BaseModel):
    provider: str
    connected: bool
    status: ConnectionStatus = ConnectionStatus.disconnected
    health: HealthStatus = HealthStatus.disconnected
    version: str = "—"
    last_sync: Optional[datetime] = None
    last_error: Optional[str] = None


class IntegrationDetail(BaseModel):
    provider: ProviderMeta
    connection: IntegrationStatus
    config_fields: list[dict[str, Any]] = []
    masked_credentials: dict[str, str] = {}


class ConnectRequest(BaseModel):
    credentials: dict[str, str] = Field(default_factory=dict)
    config: dict[str, Any] = Field(default_factory=dict)


class ConnectResponse(BaseModel):
    provider: str
    status: ConnectionStatus
    message: str
    masked_credentials: dict[str, str] = Field(default_factory=dict)


class TestConnectionResponse(BaseModel):
    provider: str
    success: bool
    message: str
    latency_ms: Optional[float] = None


class SyncResponse(BaseModel):
    provider: str
    success: bool
    message: str
    timestamp: datetime


class WorkspaceReadiness(BaseModel):
    total: int
    connected: int
    score: float
    integrations: list[IntegrationStatus]


class IntegrationListResponse(BaseModel):
    integrations: list[IntegrationDetail]
    workspace_readiness: WorkspaceReadiness
