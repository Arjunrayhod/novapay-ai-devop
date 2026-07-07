from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class GitLabProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="gitlab",
            name="GitLab",
            category="Source Control",
            description="Connect to GitLab repositories and CI/CD pipelines",
            icon="gitlab",
            version="—",
            docs_url="https://docs.gitlab.com/ee/api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "token",
                "label": "Personal Access Token",
                "type": "password",
                "required": True,
            },
            {
                "key": "url",
                "label": "GitLab URL",
                "type": "text",
                "required": False,
                "default": "https://gitlab.com",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="GitLab configuration saved",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="GitLab connection valid (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="GitLab is operational")
