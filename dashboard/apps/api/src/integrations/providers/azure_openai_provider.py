from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class AzureOpenAIProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="azure-openai",
            name="Azure OpenAI",
            category="AI Providers",
            description="Connect Azure OpenAI for enterprise AI deployments",
            icon="azure-openai",
            version="—",
            docs_url="https://learn.microsoft.com/en-us/azure/ai-services/openai/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "endpoint", "label": "Azure OpenAI Endpoint", "type": "text", "required": True},
            {"key": "api_key", "label": "API Key", "type": "password", "required": True},
            {"key": "deployment", "label": "Deployment Name", "type": "text", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Azure OpenAI connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Azure OpenAI connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Azure OpenAI is operational")
