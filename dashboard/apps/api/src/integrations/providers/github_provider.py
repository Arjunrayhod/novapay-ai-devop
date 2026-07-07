import httpx
from ..base import BaseIntegrationProvider, ProviderMeta, ConnectionResult, TestResult, HealthResult


class GitHubProvider(BaseIntegrationProvider):
    @property
    def meta(self) -> ProviderMeta:
        return ProviderMeta(
            id="github",
            name="GitHub",
            category="Source Control",
            description="Connect to GitHub repositories, pull requests, and workflows",
            icon="github",
            version="—",
            docs_url="https://docs.github.com/en/rest",
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
            {"key": "username", "label": "GitHub Username", "type": "text", "required": True},
        ]

    async def connect(self, credentials: dict[str, str], config: dict) -> ConnectionResult:
        result = await self.test_connection(credentials)
        if not result.success:
            return ConnectionResult(success=False, message=result.message)
        return ConnectionResult(
            success=True,
            message="Connected to GitHub successfully",
            version="—",
            masked_credentials=self.mask_credentials(credentials),
        )

    async def disconnect(self) -> None:
        pass

    async def test_connection(self, credentials: dict[str, str]) -> TestResult:
        token = credentials.get("token", "")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                start = __import__("time").time()
                resp = await client.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/vnd.github.v3+json",
                    },
                )
                elapsed = (__import__("time").time() - start) * 1000
                if resp.status_code == 200:
                    return TestResult(
                        success=True,
                        message=f"Authenticated as {resp.json().get('login', 'unknown')}",
                        latency_ms=round(elapsed, 1),
                    )
                return TestResult(
                    success=False,
                    message=f"GitHub API error: {resp.status_code}",
                    latency_ms=round(elapsed, 1),
                )
        except Exception as e:
            return TestResult(success=False, message=str(e))

    async def health(self, credentials: dict[str, str]) -> HealthResult:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get("https://www.githubstatus.com/api/v2/status.json")
                if resp.status_code == 200:
                    return HealthResult(
                        healthy=True, status="connected", message="GitHub is operational"
                    )
                return HealthResult(
                    healthy=False, status="warning", message="GitHub status check failed"
                )
        except Exception:
            return HealthResult(
                healthy=False, status="unknown", message="Cannot reach GitHub status page"
            )
