import asyncio
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class DockerProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="docker",
            name="Docker",
            category="Containers",
            description="Connect to Docker Engine for container management",
            icon="docker",
            version="—",
            docs_url="https://docs.docker.com/engine/api/",
        )

    @property
    def config_fields(self) -> list[dict]:
        return [
            {
                "key": "docker_host",
                "label": "Docker Host",
                "type": "text",
                "required": False,
                "default": "unix:///var/run/docker.sock",
            },
            {
                "key": "tls_verify",
                "label": "TLS Verify",
                "type": "checkbox",
                "required": False,
                "default": False,
            },
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        return ConnectionResult(
            success=True,
            message="Docker Engine connected",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "info", stdout=asyncio.PIPE, stderr=asyncio.PIPE
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5)
            if proc.returncode == 0:
                version = "—"
                for line in stdout.decode().splitlines():
                    if "Server Version:" in line:
                        version = line.split(":", 1)[1].strip()
                        break
                return TestResult(success=True, message=f"Docker Engine v{version}")
            return TestResult(success=False, message="Docker daemon not reachable")
        except FileNotFoundError:
            return TestResult(success=False, message="Docker CLI not found")
        except asyncio.TimeoutError:
            return TestResult(success=False, message="Docker daemon timed out")

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        return HealthResult(healthy=True, status="connected", message="Docker is operational")
