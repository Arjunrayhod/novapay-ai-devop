from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class DiscordProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="discord",
            name="Discord",
            category="Notifications",
            description="Connect Discord for community alerts and notifications",
            icon="discord",
            version="—",
            docs_url="https://discord.com/developers/docs",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "bot_token", "label": "Bot Token", "type": "password", "required": True},
            {"key": "guild_id", "label": "Guild ID", "type": "text", "required": False},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Discord connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Discord connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Discord is operational")
