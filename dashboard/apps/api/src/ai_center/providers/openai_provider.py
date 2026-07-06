import httpx

from . import AIProvider


class OpenAIProvider(AIProvider):
    name = "openai"
    model = ""

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self._api_key = api_key
        self.model = model
        self._client = httpx.Client(timeout=30.0)

    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        body = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048,
        }
        if tools:
            body["tools"] = tools
            body["tool_choice"] = "auto"

        response = self._client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        response.raise_for_status()
        data = response.json()
        choice = data["choices"][0]
        msg = choice["message"]

        return {
            "content": msg.get("content", ""),
            "role": "assistant",
            "tool_calls": msg.get("tool_calls", []),
            "finish_reason": choice.get("finish_reason", "stop"),
            "usage": data.get("usage", {}),
        }

    def is_available(self) -> bool:
        return bool(self._api_key) and self._api_key != ""

    def supports_streaming(self) -> bool:
        return True
