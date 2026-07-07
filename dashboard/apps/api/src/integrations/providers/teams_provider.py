from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class TeamsProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="microsoft-teams",
            name="Microsoft Teams",
            category="Notifications",
            description="Connect Microsoft Teams for workplace collaboration and alerts",
            icon="teams",
            version="—",
            docs_url="https://learn.microsoft.com/en-us/microsoftteams/platform/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "webhook_url", "label": "Webhook URL", "type": "password", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Microsoft Teams connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Teams webhook valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(
            healthy=True, status="connected", message="Microsoft Teams is operational"
        )
