from fastapi import APIRouter

from .schemas import (
    AISuggestion,
    AISuggestionsResult,
    DiagnosticReport,
    InstallCommandsResult,
    PathValidationResult,
)
from .services.ai_service import generate_suggestions
from .services.install_service import get_install_commands
from .services.path_service import validate_path
from .services.report_service import generate_report
from .services.scan_service import scan_system, scan_tools

router = APIRouter()


@router.get("/scan")
async def dev_experience_scan() -> dict:
    system = scan_system()
    tools = scan_tools()
    return {
        "system": system,
        "tools": tools,
        "scan_timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }


@router.get("/path")
async def dev_experience_path() -> PathValidationResult:
    result = validate_path()
    return PathValidationResult(**result)


@router.get("/install-commands")
async def dev_experience_install_commands() -> InstallCommandsResult:
    tools = scan_tools()
    missing_tools = [t["name"] for t in tools if not t["installed"]]
    result = get_install_commands(missing_tools)
    return InstallCommandsResult(**result)


@router.get("/ai-suggestions")
async def dev_experience_ai_suggestions() -> AISuggestionsResult:
    tools = scan_tools()
    path_result = validate_path()
    path_issues = path_result["summary"]["missing"] + path_result["summary"]["inaccessible"]
    raw = generate_suggestions(tools, path_issues)
    return AISuggestionsResult(suggestions=[AISuggestion(**s) for s in raw])


@router.get("/report")
async def dev_experience_report() -> DiagnosticReport:
    report = generate_report()
    return DiagnosticReport(**report)
