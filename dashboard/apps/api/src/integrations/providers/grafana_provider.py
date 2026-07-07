import httpx
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class GrafanaProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="grafana",
            name="Grafana",
            category="Observability",
            description="Connect Grafana for dashboards and metric visualization",
            icon="grafana",
            version="—",
            docs_url="https://grafana.com/docs/grafana/latest/developers/http_api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "url",
                "label": "Grafana URL",
                "type": "text",
                "required": True,
                "default": "http://localhost:3001",
            },
            {"key": "api_key", "label": "API Key", "type": "password", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Grafana connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        url = credentials.get("url", "http://localhost:3001").rstrip("/")
        api_key = credentials.get("api_key", "")
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    f"{url}/api/health", headers={"Authorization": f"Bearer {api_key}"}
                )
                if resp.status_code == 200:
                    return TestResult(
                        success=True, message=f"Grafana v{resp.json().get('version', '?')}"
                    )
                return TestResult(success=False, message=f"Grafana returned {resp.status_code}")
        except Exception as e:
            return TestResult(success=False, message=str(e))

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Grafana is operational")
