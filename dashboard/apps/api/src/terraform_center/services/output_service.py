import json

from ..utils import _run_terraform


def list_outputs() -> list[dict]:
    try:
        out = _run_terraform(["output", "-json"])
        data = json.loads(out)
        return [
            {
                "name": name,
                "value": info.get("value"),
                "type": info.get("type", ""),
                "sensitive": info.get("sensitive", False),
            }
            for name, info in data.items()
        ]
    except Exception:
        return []
