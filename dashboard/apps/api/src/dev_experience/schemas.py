from pydantic import BaseModel


class PathEntry(BaseModel):
    directory: str
    status: str
    note: str | None = None


class PathSummary(BaseModel):
    total: int = 0
    valid: int = 0
    missing: int = 0
    duplicate: int = 0
    inaccessible: int = 0


class PathValidationResult(BaseModel):
    entries: list[PathEntry] = []
    summary: PathSummary


class InstallCommand(BaseModel):
    tool_name: str
    provider: str
    command: str
    description: str | None = None


class InstallCommandsResult(BaseModel):
    missing_tools: list[str] = []
    commands: list[InstallCommand] = []


class AISuggestion(BaseModel):
    severity: str
    reason: str
    recommendation: str
    suggested_fix: str
    tool_name: str | None = None


class AISuggestionsResult(BaseModel):
    suggestions: list[AISuggestion] = []


class ReadinessScore(BaseModel):
    overall: int = 0
    tools_installed: int = 0
    tools_missing: int = 0
    total_tools: int = 0
    path_issues: int = 0
    critical_issues: int = 0


class DiagnosticReport(BaseModel):
    generated_at: str
    system: dict | None = None
    tools: list = []
    path_validation: PathValidationResult | None = None
    suggestions: list[AISuggestion] = []
    install_commands: list[InstallCommand] = []
    summary: ReadinessScore
