import httpx
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class OllamaProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="ollama",
            name="Ollama",
            category="AI Providers",
            description="Connect local Ollama instance for self-hosted LLMs",
            icon="ollama",
            version="—",
            docs_url="https://github.com/ollama/ollama/tree/main/docs",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "base_url",
                "label": "Ollama Base URL",
                "type": "text",
                "required": True,
                "default": "http://localhost:11434",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        result = await self.test_connection(credentials)
        if not result.success:
            return ConnectionResult(success=False, message=result.message)
        return ConnectionResult(
            success=True,
            message="Ollama connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        base_url = credentials.get("base_url", "http://localhost:11434").rstrip("/")
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{base_url}/api/tags")
                if resp.status_code == 200:
                    models = resp.json().get("models", [])
                    count = len(models)
                    return TestResult(
                        success=True,
                        message=f"Ollama reachable ({count} model{'s' if count != 1 else ''} available)",
                    )
                return TestResult(success=False, message=f"Ollama returned {resp.status_code}")
        except Exception as e:
            return TestResult(success=False, message=str(e))

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Ollama is operational")
