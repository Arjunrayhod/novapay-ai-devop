from ..schemas import AIHealth
from .provider_service import get_provider_info


def get_ai_health() -> AIHealth:
    info = get_provider_info()
    return AIHealth(
        provider=info.name,
        model=info.model,
        available=info.available,
        message="AI provider is operational" if info.available else "AI provider is not available",
    )
