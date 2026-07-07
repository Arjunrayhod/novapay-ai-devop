from pydantic import BaseModel


class SastIssue(BaseModel):
    file: str
    line: int
    severity: str
    check_id: str
    message: str
    code_snippet: str = ""


class SastScanResult(BaseModel):
    tool: str
    issues: list[SastIssue] = []
    total_issues: int = 0
    scan_time_ms: float = 0
    files_scanned: int = 0


class DependencyVulnerability(BaseModel):
    package: str
    installed_version: str = ""
    vulnerable_versions: str = ""
    severity: str = ""
    advisory: str = ""
    cve: str = ""


class DependencyAuditResult(BaseModel):
    total_packages: int = 0
    vulnerable_count: int = 0
    vulnerabilities: list[DependencyVulnerability] = []


class VulnerabilitySummary(BaseModel):
    total: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    sources: list[str] = []


class Policy(BaseModel):
    name: str
    path: str = ""
    status: str = ""
    rules_count: int = 0
    last_evaluated: str = ""


class PolicyEvaluation(BaseModel):
    policy: str
    passed: bool = False
    violations: list[str] = []
    duration_ms: float = 0


class ComplianceCheck(BaseModel):
    framework: str
    status: str
    passed: int = 0
    failed: int = 0
    total: int = 0
    score: float = 0.0


class ComplianceReport(BaseModel):
    overall_score: float = 0.0
    checks: list[ComplianceCheck] = []


class SecurityHealth(BaseModel):
    sast: str = "unavailable"
    dependency_scan: str = "unavailable"
    vulnerability_db: str = "unavailable"
    opa: str = "unavailable"
    trivy: str = "unavailable"


class SecurityOverview(BaseModel):
    sast_available: bool = False
    dependency_scan_available: bool = False
    vulnerability_db_available: bool = False
    opa_available: bool = False
    trivy_available: bool = False
    total_issues: int = 0
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    policy_count: int = 0
    compliance_score: float = 0.0


class AuditLogEntry(BaseModel):
    timestamp: str
    action: str
    resource: str = ""
    result: str = ""
    detail: str = ""
