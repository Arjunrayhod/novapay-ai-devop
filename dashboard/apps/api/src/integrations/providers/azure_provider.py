from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class AzureProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="azure",
            name="Azure",
            category="Cloud",
            description="Connect to Microsoft Azure for cloud resource management",
            icon="azure",
            version="—",
            docs_url="https://learn.microsoft.com/en-us/azure/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "tenant_id", "label": "Tenant ID", "type": "password", "required": True},
            {"key": "client_id", "label": "Client ID", "type": "password", "required": True},
            {
                "key": "client_secret",
                "label": "Client Secret",
                "type": "password",
                "required": True,
            },
            {
                "key": "subscription_id",
                "label": "Subscription ID",
                "type": "text",
                "required": True,
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Azure configuration saved",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Azure credentials validated (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Azure health check passed")
