from fastapi import APIRouter

from .schemas import (
    ComplianceReport,
    DependencyAuditResult,
    Policy,
    PolicyEvaluation,
    SastScanResult,
    SecurityHealth,
    SecurityOverview,
    VulnerabilitySummary,
)
from .services.compliance_service import check_compliance
from .services.dependency_service import scan_dependencies
from .services.health_service import get_security_health, get_security_overview
from .services.policy_service import evaluate_all_policies, list_opa_policies
from .services.sast_service import run_sast_scan
from .services.vulnerability_service import _aggregate_vulnerabilities

router = APIRouter()


@router.get("/health")
async def security_health() -> SecurityHealth:
    return SecurityHealth(**get_security_health())


@router.get("/overview")
async def security_overview() -> SecurityOverview:
    return SecurityOverview(**get_security_overview())


@router.get("/sast/scan")
async def sast_scan(target: str = "") -> SastScanResult:
    return SastScanResult(**run_sast_scan(target))


@router.get("/dependencies")
async def dependency_audit() -> DependencyAuditResult:
    return DependencyAuditResult(**scan_dependencies())


@router.get("/vulnerabilities")
async def vulnerability_summary() -> VulnerabilitySummary:
    return VulnerabilitySummary(**_aggregate_vulnerabilities())


@router.get("/policies")
async def opa_policies() -> list[Policy]:
    return [Policy(**p) for p in list_opa_policies()]


@router.get("/policies/evaluate")
async def policy_evaluation() -> list[PolicyEvaluation]:
    return [PolicyEvaluation(**e) for e in evaluate_all_policies()]


@router.get("/compliance")
async def compliance_report() -> ComplianceReport:
    return ComplianceReport(**check_compliance())
