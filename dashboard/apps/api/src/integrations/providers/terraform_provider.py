import asyncio
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class TerraformIntegrationProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="terraform",
            name="Terraform",
            category="Containers",
            description="Connect Terraform for Infrastructure as Code management",
            icon="terraform",
            version="—",
            docs_url="https://developer.hashicorp.com/terraform/docs",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {"key": "working_dir", "label": "Working Directory", "type": "text", "required": False},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Terraform configured",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        try:
            proc = await asyncio.create_subprocess_exec(
                "terraform", "version", stdout=asyncio.PIPE, stderr=asyncio.PIPE
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5)
            if proc.returncode == 0:
                return TestResult(success=True, message=stdout.decode().splitlines()[0].strip())
            return TestResult(success=False, message="Terraform not available")
        except FileNotFoundError:
            return TestResult(success=False, message="Terraform CLI not found")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Terraform is operational")
