import httpx

from . import AIProvider


class AzureOpenAIProvider(AIProvider):
    name = "azure"
    model = ""

    def __init__(self, endpoint: str, api_key: str, deployment: str):
        self._endpoint = endpoint.rstrip("/")
        self._api_key = api_key
        self.model = deployment
        self._client = httpx.Client(timeout=30.0)

    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        url = (
            f"{self._endpoint}/openai/deployments/{self.model}"
            "/chat/completions?api-version=2024-02-15-preview"
        )
        body = {
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048,
        }
        if tools:
            body["tools"] = tools
            body["tool_choice"] = "auto"

        response = self._client.post(
            url,
            headers={
                "api-key": self._api_key,
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
        return bool(self._endpoint) and bool(self._api_key)

    def supports_streaming(self) -> bool:
        return True
