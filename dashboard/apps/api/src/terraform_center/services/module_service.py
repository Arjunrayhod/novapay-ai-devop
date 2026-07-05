import json

from ..utils import _run_terraform


def list_modules() -> list[dict]:
    try:
        out = _run_terraform(["show", "-json"])
        data = json.loads(out)
        values = data.get("values", {})
        root = values.get("root_module", {})
        child_modules = root.get("child_modules", [])

        modules = []
        for m in child_modules:
            modules.append(
                {
                    "address": m.get("address", ""),
                    "source": m.get("module_call", {}).get("source", ""),
                    "version": m.get("module_call", {}).get("version", ""),
                    "resource_count": len(m.get("resources", [])),
                }
            )

        return modules
    except Exception:
        return []


def get_module_resources(module_address: str) -> list[dict]:
    try:
        out = _run_terraform(["show", "-json"])
        data = json.loads(out)
        values = data.get("values", {})
        root = values.get("root_module", {})

        for m in root.get("child_modules", []):
            if m.get("address") == module_address:
                return [
                    {
                        "address": r.get("address", ""),
                        "type": r.get("type", ""),
                        "name": r.get("name", ""),
                        "provider": r.get("provider_name", ""),
                        "mode": r.get("mode", ""),
                    }
                    for r in m.get("resources", [])
                ]
        return []
    except Exception:
        return []
