import json
import os

from ..utils import _run_terraform


def get_plan() -> dict:
    plan_file = "tfplan"
    if not os.path.isfile(plan_file):
        return {
            "available": False,
            "resources_add": 0,
            "resources_change": 0,
            "resources_destroy": 0,
            "plan_data": "",
        }
    try:
        out = _run_terraform(["show", "-json", plan_file])
        data = json.loads(out)
        changes = data.get("resource_changes", [])
        add = sum(1 for c in changes if c.get("change", {}).get("actions") == ["create"])
        change = sum(1 for c in changes if c.get("change", {}).get("actions") == ["update"])
        destroy = sum(1 for c in changes if c.get("change", {}).get("actions") == ["delete"])

        return {
            "available": True,
            "resources_add": add,
            "resources_change": change,
            "resources_destroy": destroy,
            "plan_data": json.dumps(data, indent=2),
        }
    except Exception:
        return {
            "available": False,
            "resources_add": 0,
            "resources_change": 0,
            "resources_destroy": 0,
            "plan_data": "",
        }
