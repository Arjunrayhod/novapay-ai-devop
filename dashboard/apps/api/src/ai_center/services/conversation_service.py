import uuid
from datetime import UTC, datetime

from ..schemas import Conversation, Message

_store: dict[str, Conversation] = {}


def create_conversation(title: str = "New Conversation") -> Conversation:
    now = datetime.now(UTC).isoformat()
    conv = Conversation(
        id=str(uuid.uuid4()),
        title=title,
        messages=[],
        created_at=now,
        updated_at=now,
    )
    _store[conv.id] = conv
    return conv


def get_conversation(conversation_id: str) -> Conversation | None:
    return _store.get(conversation_id)


def update_conversation(conversation_id: str, message: Message) -> Conversation | None:
    conv = _store.get(conversation_id)
    if not conv:
        return None
    conv.messages.append(message)
    conv.updated_at = datetime.now(UTC).isoformat()
    if len(conv.messages) == 1:
        conv.title = message.content[:60] + "..." if len(message.content) > 60 else message.content
    return conv


def delete_conversation(conversation_id: str) -> bool:
    if conversation_id in _store:
        del _store[conversation_id]
        return True
    return False


def list_conversations() -> list[Conversation]:
    return sorted(_store.values(), key=lambda c: c.updated_at, reverse=True)


def add_message(conversation_id: str, role: str, content: str) -> Message | None:
    conv = _store.get(conversation_id)
    if not conv:
        return None
    message = Message(
        role=role,
        content=content,
        timestamp=datetime.now(UTC).isoformat(),
    )
    conv.messages.append(message)
    conv.updated_at = datetime.now(UTC).isoformat()
    return message
