import httpx

from . import AIProvider


class OllamaProvider(AIProvider):
    name = "ollama"
    model = ""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self._base_url = base_url.rstrip("/")
        self.model = model
        self._client = httpx.Client(timeout=60.0)

    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        body = {
            "model": self.model,
            "messages": messages,
            "stream": False,
        }

        response = self._client.post(
            f"{self._base_url}/api/chat",
            json=body,
        )
        response.raise_for_status()
        data = response.json()

        return {
            "content": data.get("message", {}).get("content", ""),
            "role": "assistant",
            "tool_calls": [],
            "finish_reason": "stop",
            "usage": {
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0),
            },
        }

    def is_available(self) -> bool:
        try:
            response = self._client.get(f"{self._base_url}/api/tags", timeout=5.0)
            return response.status_code == 200
        except Exception:
            return False

    def supports_streaming(self) -> bool:
        return True
