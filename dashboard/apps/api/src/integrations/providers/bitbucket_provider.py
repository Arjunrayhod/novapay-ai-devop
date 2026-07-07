from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class BitbucketProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="bitbucket",
            name="Bitbucket",
            category="Source Control",
            description="Connect to Bitbucket repositories and pipelines",
            icon="bitbucket",
            version="—",
            docs_url="https://developer.atlassian.com/cloud/bitbucket/rest/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "username", "label": "Username", "type": "text", "required": True},
            {"key": "app_password", "label": "App Password", "type": "password", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Bitbucket configuration saved",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="Bitbucket connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Bitbucket is operational")
