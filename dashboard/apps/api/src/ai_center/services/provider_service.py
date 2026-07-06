from ..providers import AIProvider
from ..providers.azure_provider import AzureOpenAIProvider as AzureProvider
from ..providers.gemini_provider import GeminiProvider
from ..providers.mock_provider import MockProvider
from ..providers.ollama_provider import OllamaProvider
from ..providers.openai_provider import OpenAIProvider
from ..schemas import ProviderInfo
from ..utils import get_provider_config

_provider_instance: AIProvider | None = None


def get_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    cfg = get_provider_config()
    provider_name = cfg["provider"]

    if provider_name == "openai":
        _provider_instance = OpenAIProvider(
            api_key=cfg["openai_api_key"],
            model=cfg["openai_model"],
        )
    elif provider_name == "gemini":
        _provider_instance = GeminiProvider(
            api_key=cfg["gemini_api_key"],
            model=cfg["gemini_model"],
        )
    elif provider_name == "ollama":
        _provider_instance = OllamaProvider(
            base_url=cfg["ollama_base_url"],
            model=cfg["ollama_model"],
        )
    elif provider_name == "azure":
        _provider_instance = AzureProvider(
            endpoint=cfg["azure_endpoint"],
            api_key=cfg["azure_api_key"],
            deployment=cfg["azure_deployment"],
        )
    else:
        _provider_instance = MockProvider()

    return _provider_instance


def get_provider_info() -> ProviderInfo:
    provider = get_provider()
    return ProviderInfo(
        name=provider.name,
        model=provider.model,
        available=provider.is_available(),
        supports_streaming=provider.supports_streaming(),
    )


def reset_provider():
    global _provider_instance
    _provider_instance = None
