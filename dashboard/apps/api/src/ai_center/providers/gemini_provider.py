import httpx

from . import AIProvider


class GeminiProvider(AIProvider):
    name = "gemini"
    model = ""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self._api_key = api_key
        self.model = model
        self._client = httpx.Client(timeout=30.0)

    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        gemini_contents = []
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            gemini_contents.append(
                {
                    "role": role,
                    "parts": [{"text": msg["content"]}],
                }
            )

        body = {
            "contents": gemini_contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
            },
        }

        response = self._client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self._api_key}",
            json=body,
        )
        response.raise_for_status()
        data = response.json()
        candidate = data["candidates"][0]
        content_parts = candidate.get("content", {}).get("parts", [])
        text = "".join(p.get("text", "") for p in content_parts)

        return {
            "content": text,
            "role": "assistant",
            "tool_calls": [],
            "finish_reason": candidate.get("finishReason", "stop"),
            "usage": {},
        }

    def is_available(self) -> bool:
        return bool(self._api_key) and self._api_key != ""

    def supports_streaming(self) -> bool:
        return False
