from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional


@dataclass
class ProviderMeta:
    id: str
    name: str
    category: str
    description: str
    icon: str
    version: str = "—"
    docs_url: str = ""


@dataclass
class ConnectionResult:
    success: bool
    message: str
    version: str = "—"
    masked_credentials: Optional[dict[str, str]] = None


@dataclass
class TestResult:
    success: bool
    message: str
    latency_ms: Optional[float] = None


@dataclass
class HealthResult:
    healthy: bool
    status: str  # connected | disconnected | error | warning | unknown
    message: str = ""


class BaseIntegrationProvider(ABC):
    @property
    @abstractmethod
    def meta(self) -> ProviderMeta: ...

    @property
    def config_fields(self) -> list[dict[str, Any]]:
        return []

    @abstractmethod
    async def connect(
        self, credentials: dict[str, str], config: dict[str, Any]
    ) -> ConnectionResult: ...

    @abstractmethod
    async def disconnect(self) -> None: ...

    @abstractmethod
    async def test_connection(self, credentials: dict[str, str]) -> TestResult: ...

    @abstractmethod
    async def health(self, credentials: dict[str, str]) -> HealthResult: ...

    async def sync(self, credentials: dict[str, str]) -> dict[str, Any]:
        return {"synced_at": datetime.now(timezone.utc).isoformat()}

    @staticmethod
    def mask_value(value: str) -> str:
        if len(value) <= 8:
            return "*" * len(value)
        return "*" * (len(value) - 4) + value[-4:]

    @staticmethod
    def mask_credentials(creds: dict[str, str]) -> dict[str, str]:
        return {k: BaseIntegrationProvider.mask_value(v) for k, v in creds.items()}

    async def check_available(self) -> bool:
        return True
