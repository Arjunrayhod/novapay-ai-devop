import json

from ..utils import _run_terraform


def list_providers() -> list[dict]:
    try:
        out = _run_terraform(["providers", "-json"])
        data = json.loads(out)
        result = []
        for key, info in data.items():
            parts = key.split("/")
            name = parts[-1] if len(parts) > 1 else parts[0]
            result.append(
                {
                    "name": name,
                    "version": info.get("version", ""),
                    "source": key,
                }
            )
        return result
    except Exception:
        return []
