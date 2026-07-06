from ..schemas import AIOverview, ChatRequest, ChatResponse, Message
from .conversation_service import (
    add_message,
    create_conversation,
    get_conversation,
    update_conversation,
)
from .prompt_service import get_prompt, get_prompts
from .provider_service import get_provider, get_provider_info
from .tool_service import execute_tools, get_tool_definitions


async def process_chat(request: ChatRequest) -> ChatResponse:
    provider = get_provider()

    conversation_id = request.conversation_id
    if not conversation_id:
        conversation = create_conversation(request.message[:60])
        conversation_id = conversation.id
    else:
        conversation = get_conversation(conversation_id)
        if not conversation:
            conversation = create_conversation(request.message[:60])
            conversation_id = conversation.id

    add_message(conversation_id, "user", request.message)

    system_prompt = ""
    if request.prompt_id:
        prompt = get_prompt(request.prompt_id)
        if prompt:
            system_prompt = prompt.system_prompt

    if provider.name != "mock":
        tool_names = [t.name for t in get_tool_definitions()]
        tool_results = await execute_tools(tool_names)
        platform_context = "\n\n".join(
            f"=== {r.tool} ===\n{r.data if r.success else f'Error: {r.error}'}"
            for r in tool_results
        )
    else:
        platform_context = ""

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    conversation = get_conversation(conversation_id)
    if conversation:
        for msg in conversation.messages[:-1]:
            messages.append({"role": msg.role, "content": msg.content})

    if platform_context.strip():
        messages.append(
            {
                "role": "system",
                "content": f"Here is the current platform data:\n\n{platform_context}\n\n"
                "Base your response on this data. If the data is insufficient to answer, "
                "say: 'I don't have enough data.' Never invent metrics or make up information.",
            }
        )

    messages.append({"role": "user", "content": request.message})

    response = provider.chat(messages)

    content = response.get("content", "")
    assistant_message = Message(
        role="assistant",
        content=content,
    )

    if conversation_id:
        update_conversation(conversation_id, assistant_message)

    return ChatResponse(
        message=assistant_message,
        conversation_id=conversation_id,
        tool_calls=response.get("tool_calls", []),
    )


def get_overview() -> AIOverview:
    provider_info = get_provider_info()
    prompts = get_prompts()
    tools = get_tool_definitions()
    from .conversation_service import list_conversations

    conversations = list_conversations()

    return AIOverview(
        provider_available=provider_info.available,
        provider_name=provider_info.name,
        model=provider_info.model,
        available_prompts=len(prompts),
        available_tools=len(tools),
        active_conversations=len(conversations),
    )
