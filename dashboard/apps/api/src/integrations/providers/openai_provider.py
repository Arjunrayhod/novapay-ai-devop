import httpx
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class OpenAIProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="openai",
            name="OpenAI",
            category="AI Providers",
            description="Connect OpenAI for GPT models and embeddings",
            icon="openai",
            version="—",
            docs_url="https://platform.openai.com/docs/api-reference",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "api_key", "label": "API Key", "type": "password", "required": True},
            {"key": "organization", "label": "Organization ID", "type": "text", "required": False},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        result = await self.test_connection(credentials)
        if not result.success:
            return ConnectionResult(success=False, message=result.message)
        return ConnectionResult(
            success=True,
            message="OpenAI connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        api_key = credentials.get("api_key", "")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                start = __import__("time").time()
                resp = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                elapsed = (__import__("time").time() - start) * 1000
                if resp.status_code == 200:
                    return TestResult(
                        success=True, message="OpenAI API key valid", latency_ms=round(elapsed, 1)
                    )
                return TestResult(success=False, message=f"OpenAI returned {resp.status_code}")
        except Exception as e:
            return TestResult(success=False, message=str(e))

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get("https://status.openai.com/api/v2/status.json")
                if resp.status_code == 200:
                    return HealthResult(
                        healthy=True, status="connected", message="OpenAI is operational"
                    )
                return HealthResult(healthy=False, status="warning")
        except Exception:
            return HealthResult(
                healthy=False, status="unknown", message="Cannot reach OpenAI status"
            )
