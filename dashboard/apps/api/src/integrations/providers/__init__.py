from typing import Optional

from .github_provider import GitHubProvider
from .gitlab_provider import GitLabProvider
from .bitbucket_provider import BitbucketProvider
from .aws_provider import AWSProvider
from .azure_provider import AzureProvider
from .gcloud_provider import GCloudProvider
from .docker_provider import DockerProvider
from .kubernetes_provider import KubernetesIntegrationProvider
from .helm_provider import HelmIntegrationProvider
from .terraform_provider import TerraformIntegrationProvider
from .grafana_provider import GrafanaProvider
from .prometheus_provider import PrometheusProvider
from .loki_provider import LokiProvider
from .tempo_provider import TempoProvider
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiProvider
from .claude_provider import ClaudeProvider
from .azure_openai_provider import AzureOpenAIProvider
from .ollama_provider import OllamaProvider
from .slack_provider import SlackProvider
from .discord_provider import DiscordProvider
from .teams_provider import TeamsProvider

from ..base import BaseIntegrationProvider

_PROVIDERS: dict[str, BaseIntegrationProvider] = {}


def register_provider(provider: BaseIntegrationProvider) -> None:
    _PROVIDERS[provider.meta.id] = provider


def get_provider(provider_id: str) -> Optional[BaseIntegrationProvider]:
    return _PROVIDERS.get(provider_id)


def list_providers() -> list[BaseIntegrationProvider]:
    return list(_PROVIDERS.values())


def list_providers_by_category() -> dict[str, list[BaseIntegrationProvider]]:
    result: dict[str, list[BaseIntegrationProvider]] = {}
    for p in _PROVIDERS.values():
        result.setdefault(p.meta.category, []).append(p)
    return result


# Register all providers
for _p in [
    GitHubProvider(),
    GitLabProvider(),
    BitbucketProvider(),
    AWSProvider(),
    AzureProvider(),
    GCloudProvider(),
    DockerProvider(),
    KubernetesIntegrationProvider(),
    HelmIntegrationProvider(),
    TerraformIntegrationProvider(),
    GrafanaProvider(),
    PrometheusProvider(),
    LokiProvider(),
    TempoProvider(),
    OpenAIProvider(),
    GeminiProvider(),
    ClaudeProvider(),
    AzureOpenAIProvider(),
    OllamaProvider(),
    SlackProvider(),
    DiscordProvider(),
    TeamsProvider(),
]:
    register_provider(_p)


__all__ = [
    "get_provider",
    "list_providers",
    "list_providers_by_category",
    "register_provider",
]
