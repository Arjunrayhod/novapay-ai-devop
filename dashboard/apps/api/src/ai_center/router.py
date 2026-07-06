from fastapi import APIRouter, HTTPException

from .schemas import (
    AIHealth,
    AIOverview,
    ChatRequest,
    ChatResponse,
    Conversation,
    Insight,
    Prompt,
    ProviderInfo,
    Recommendation,
    ToolDefinition,
)
from .services.assistant_service import get_overview, process_chat
from .services.conversation_service import delete_conversation, get_conversation, list_conversations
from .services.health_service import get_ai_health
from .services.insight_service import generate_insights
from .services.prompt_service import get_prompts
from .services.provider_service import get_provider_info
from .services.recommendation_service import generate_recommendations
from .services.tool_service import get_tool_definitions

router = APIRouter()


@router.get("/models")
async def list_models() -> list[ProviderInfo]:
    return [get_provider_info()]


@router.post("/chat")
async def chat_completion(request: ChatRequest) -> ChatResponse:
    return await process_chat(request)


@router.get("/health")
async def ai_health() -> AIHealth:
    return get_ai_health()


@router.get("/overview")
async def ai_overview() -> AIOverview:
    return get_overview()


@router.get("/insights")
async def ai_insights() -> list[Insight]:
    return generate_insights()


@router.get("/recommendations")
async def ai_recommendations() -> list[Recommendation]:
    return generate_recommendations()


@router.get("/prompts")
async def ai_prompts() -> list[Prompt]:
    return get_prompts()


@router.get("/tools")
async def ai_tools() -> list[ToolDefinition]:
    return get_tool_definitions()


@router.get("/conversations")
async def ai_conversations() -> list[Conversation]:
    return list_conversations()


@router.get("/conversations/{conversation_id}")
async def ai_conversation(conversation_id: str) -> Conversation:
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/conversations/{conversation_id}")
async def ai_delete_conversation(conversation_id: str):
    if not delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted"}
