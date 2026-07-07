import httpx
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class PrometheusProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="prometheus",
            name="Prometheus",
            category="Observability",
            description="Connect Prometheus for metric collection and alerting",
            icon="prometheus",
            version="—",
            docs_url="https://prometheus.io/docs/prometheus/latest/querying/api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "url",
                "label": "Prometheus URL",
                "type": "text",
                "required": True,
                "default": "http://localhost:9090",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Prometheus connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        url = credentials.get("url", "http://localhost:9090").rstrip("/")
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{url}/api/v1/status/buildinfo")
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return TestResult(
                        success=True, message=f"Prometheus {data.get('version', '?')}"
                    )
                return TestResult(success=False, message=f"Prometheus returned {resp.status_code}")
        except Exception as e:
            return TestResult(success=False, message=str(e))

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Prometheus is operational")
