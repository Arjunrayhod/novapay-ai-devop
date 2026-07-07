from ..settings import settings


def get_provider_config() -> dict:
    return {
        "provider": settings.AI_PROVIDER,
        "openai_api_key": settings.OPENAI_API_KEY,
        "openai_model": settings.OPENAI_MODEL,
        "gemini_api_key": settings.GEMINI_API_KEY,
        "gemini_model": settings.GEMINI_MODEL,
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "azure_endpoint": settings.AZURE_OPENAI_ENDPOINT,
        "azure_api_key": settings.AZURE_OPENAI_API_KEY,
        "azure_deployment": settings.AZURE_OPENAI_DEPLOYMENT,
    }


def _get_internal_base_url() -> str:
    return f"http://localhost:{settings.API_PORT}"
