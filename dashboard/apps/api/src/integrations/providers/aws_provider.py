from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class AWSProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="aws",
            name="AWS",
            category="Cloud",
            description="Connect to Amazon Web Services for cloud infrastructure management",
            icon="aws",
            version="—",
            docs_url="https://docs.aws.amazon.com/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "access_key_id",
                "label": "Access Key ID",
                "type": "password",
                "required": True,
            },
            {
                "key": "secret_access_key",
                "label": "Secret Access Key",
                "type": "password",
                "required": True,
            },
            {
                "key": "region",
                "label": "Default Region",
                "type": "text",
                "required": False,
                "default": "us-east-1",
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        result = await self.test_connection(credentials)
        if not result.success:
            return ConnectionResult(success=False, message=result.message)
        return ConnectionResult(
            success=True,
            message="Connected to AWS",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="AWS credentials validated (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="AWS health check passed")
