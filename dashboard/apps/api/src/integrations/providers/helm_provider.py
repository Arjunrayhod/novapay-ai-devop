import asyncio
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class HelmIntegrationProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="helm",
            name="Helm",
            category="Containers",
            description="Connect Helm for Kubernetes package management",
            icon="helm",
            version="—",
            docs_url="https://helm.sh/docs/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "repo_url", "label": "Default Repo URL", "type": "text", "required": False},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Helm configured",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        try:
            proc = await asyncio.create_subprocess_exec(
                "helm", "version", stdout=asyncio.PIPE, stderr=asyncio.PIPE
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5)
            if proc.returncode == 0:
                return TestResult(success=True, message=stdout.decode().strip())
            return TestResult(success=False, message="Helm not available")
        except FileNotFoundError:
            return TestResult(success=False, message="Helm CLI not found")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Helm is operational")
