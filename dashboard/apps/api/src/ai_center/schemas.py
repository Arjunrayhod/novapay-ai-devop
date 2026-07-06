from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str
    timestamp: str = ""


class Conversation(BaseModel):
    id: str
    title: str = ""
    messages: list[Message] = []
    created_at: str = ""
    updated_at: str = ""


class ChatRequest(BaseModel):
    message: str
    conversation_id: str = ""
    prompt_id: str = ""
    model: str = ""


class ChatResponse(BaseModel):
    message: Message
    conversation_id: str
    tool_calls: list[dict] = []


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: dict = {}


class ToolResult(BaseModel):
    tool: str
    success: bool
    data: dict | list | str | None = None
    error: str = ""


class ProviderInfo(BaseModel):
    name: str
    model: str
    available: bool
    supports_streaming: bool = False


class AIHealth(BaseModel):
    provider: str = "unavailable"
    model: str = ""
    available: bool = False
    message: str = ""


class AIOverview(BaseModel):
    provider_available: bool = False
    provider_name: str = ""
    model: str = ""
    available_prompts: int = 0
    available_tools: int = 0
    active_conversations: int = 0


class Prompt(BaseModel):
    id: str
    name: str
    description: str = ""
    system_prompt: str = ""
    icon: str = ""


class Recommendation(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    module: str = ""
    impact: str = ""


class Insight(BaseModel):
    id: str
    type: str
    title: str
    summary: str
    details: str = ""
    module: str = ""
    severity: str = "info"
