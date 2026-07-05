import json

from ..utils import _run_terraform


def get_state_summary() -> dict:
    try:
        out = _run_terraform(["show", "-json"])
        data = json.loads(out)
        values = data.get("values", {})
        root = values.get("root_module", {})
        resources = root.get("resources", [])
        child_modules = root.get("child_modules", [])
        outputs = values.get("outputs", {})

        all_resources = list(resources)
        for m in child_modules:
            all_resources.extend(m.get("resources", []))

        return {
            "version": data.get("format_version", ""),
            "terraform_version": data.get("terraform_version", ""),
            "resource_count": len(all_resources),
            "module_count": len(child_modules),
            "output_count": len(outputs),
        }
    except Exception:
        return {
            "version": "",
            "terraform_version": "",
            "resource_count": 0,
            "module_count": 0,
            "output_count": 0,
        }


def is_state_loaded() -> bool:
    try:
        _run_terraform(["show", "-json"])
        return True
    except Exception:
        return False
