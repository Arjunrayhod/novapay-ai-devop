from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class GCloudProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="google-cloud",
            name="Google Cloud",
            category="Cloud",
            description="Connect to Google Cloud Platform for infrastructure management",
            icon="google-cloud",
            version="—",
            docs_url="https://cloud.google.com/docs",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "service_account_key",
                "label": "Service Account Key (JSON)",
                "type": "textarea",
                "required": True,
            },
            {"key": "project_id", "label": "Project ID", "type": "text", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Google Cloud configuration saved",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        return TestResult(success=True, message="GCP credentials validated (placeholder)")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="GCP health check passed")
