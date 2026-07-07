import os
from pathlib import Path

from ..utils import _check_cli, _run_cli


def _discover_policies(directory: str = "") -> list[dict]:
    if not directory:
        from ..utils import _get_project_root

        directory = os.path.join(_get_project_root(), "policies")

    policies = []
    for pattern in ["*.rego", "*.yaml", "*.yml"]:
        for p in Path(directory).rglob(pattern):
            policies.append(
                {
                    "name": p.stem,
                    "path": str(p),
                    "status": "discovered",
                    "rules_count": 0,
                    "last_evaluated": "",
                }
            )
    return policies


def _evaluate_policy_local(policy_path: str) -> dict | None:
    if not _check_cli("opa"):
        return None
    try:
        _run_cli(
            ["opa", "eval", "--data", policy_path, "--input", "/dev/stdin", "data"], timeout=30
        )
        return {"passed": True, "violations": [], "duration_ms": 0}
    except Exception:
        return None


def list_opa_policies() -> list[dict]:
    return _discover_policies()


def evaluate_all_policies() -> list[dict]:
    policies = _discover_policies()
    if not _check_cli("opa"):
        return [
            {
                "policy": p["name"],
                "passed": False,
                "violations": ["OPA CLI not available"],
                "duration_ms": 0,
            }
            for p in policies
        ]

    evaluations = []
    for p in policies:
        ev = _evaluate_policy_local(p["path"])
        if ev:
            evaluations.append(
                {
                    "policy": p["name"],
                    "passed": ev["passed"],
                    "violations": ev["violations"],
                    "duration_ms": ev["duration_ms"],
                }
            )
        else:
            evaluations.append(
                {
                    "policy": p["name"],
                    "passed": False,
                    "violations": ["Evaluation failed"],
                    "duration_ms": 0,
                }
            )
    return evaluations
