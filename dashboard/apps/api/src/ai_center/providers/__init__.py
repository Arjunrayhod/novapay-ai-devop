from abc import ABC, abstractmethod


class AIProvider(ABC):
    name: str = ""
    model: str = ""

    @abstractmethod
    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict: ...

    @abstractmethod
    def is_available(self) -> bool: ...

    def supports_streaming(self) -> bool:
        return False
