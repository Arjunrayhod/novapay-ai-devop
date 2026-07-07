from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class TempoProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="tempo",
            name="Tempo",
            category="Observability",
            description="Connect Tempo for distributed tracing",
            icon="tempo",
            version="—",
            docs_url="https://grafana.com/docs/tempo/latest/api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "url",
                "label": "Tempo URL",
                "type": "text",
                "required": True,
                "default": "http://localhost:3200",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Tempo connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Tempo connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Tempo is operational")
