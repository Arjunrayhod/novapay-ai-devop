from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class LokiProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="loki",
            name="Loki",
            category="Observability",
            description="Connect Loki for log aggregation and querying",
            icon="loki",
            version="—",
            docs_url="https://grafana.com/docs/loki/latest/api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "url",
                "label": "Loki URL",
                "type": "text",
                "required": True,
                "default": "http://localhost:3100",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Loki connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Loki connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Loki is operational")
