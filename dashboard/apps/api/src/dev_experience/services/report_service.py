from datetime import datetime

from .ai_service import generate_suggestions
from .path_service import validate_path
from .scan_service import scan_system, scan_tools


def _calculate_readiness(
    tools: list[dict],
    path_issues: int,
    suggestions: list[dict[str, str]],
) -> dict[str, int]:
    total = len(tools)
    installed = sum(1 for t in tools if t["installed"])
    missing = total - installed
    critical = sum(1 for s in suggestions if s["severity"] == "critical")

    installed_ratio = installed / total if total > 0 else 1
    path_penalty = min(path_issues * 5, 30)
    critical_penalty = critical * 15

    score = max(0, min(100, int(installed_ratio * 100 - path_penalty - critical_penalty)))

    return {
        "overall": score,
        "tools_installed": installed,
        "tools_missing": missing,
        "total_tools": total,
        "path_issues": path_issues,
        "critical_issues": critical,
    }


def generate_report() -> dict:
    system = scan_system()
    tools = scan_tools()
    path_result = validate_path()
    path_issues = path_result["summary"]["missing"] + path_result["summary"]["inaccessible"]
    suggestions = generate_suggestions(tools, path_issues)

    summary = _calculate_readiness(tools, path_issues, suggestions)

    from .install_service import get_install_commands

    missing_tools = [t["name"] for t in tools if not t["installed"]]
    install_result = get_install_commands(missing_tools)

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "system": system,
        "tools": tools,
        "path_validation": path_result,
        "suggestions": suggestions,
        "install_commands": install_result["commands"],
        "summary": summary,
    }
