import json

from ..utils import _run_terraform


def list_resources() -> list[dict]:
    try:
        out = _run_terraform(["show", "-json"])
        data = json.loads(out)
        values = data.get("values", {})
        root = values.get("root_module", {})
        resources = root.get("resources", [])
        child_modules = root.get("child_modules", [])

        result = []
        for r in resources:
            result.append(
                {
                    "address": r.get("address", ""),
                    "type": r.get("type", ""),
                    "name": r.get("name", ""),
                    "provider": r.get("provider_name", ""),
                    "module": "",
                    "mode": r.get("mode", ""),
                    "count": r.get("count"),
                }
            )

        for m in child_modules:
            module_addr = m.get("address", "")
            for r in m.get("resources", []):
                result.append(
                    {
                        "address": r.get("address", ""),
                        "type": r.get("type", ""),
                        "name": r.get("name", ""),
                        "provider": r.get("provider_name", ""),
                        "module": module_addr,
                        "mode": r.get("mode", ""),
                        "count": r.get("count"),
                    }
                )

        return result
    except Exception:
        return []
