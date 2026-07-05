from ..utils import _check_cli


def get_security_health() -> dict:
    return {
        "sast": "available" if _check_cli("bandit") else "available-builtin",
        "dependency_scan": "available" if _check_cli("safety") else "available-builtin",
        "vulnerability_db": "available" if _check_cli("trivy") else "unavailable",
        "opa": "available" if _check_cli("opa") else "unavailable",
        "trivy": "available" if _check_cli("trivy") else "unavailable",
    }


def get_security_overview() -> dict:
    health = get_security_health()
    total_issues = 0
    critical_count = 0
    high_count = 0
    medium_count = 0

    try:
        from .vulnerability_service import _aggregate_vulnerabilities

        vuln = _aggregate_vulnerabilities()
        total_issues += vuln["total"]
        critical_count += vuln["critical"]
        high_count += vuln["high"]
        medium_count += vuln["medium"]
    except Exception:
        pass

    try:
        from .sast_service import run_sast_scan

        sast = run_sast_scan()
        total_issues += sast["total_issues"]
    except Exception:
        pass

    policy_count = 0
    try:
        from .policy_service import list_opa_policies

        policy_count = len(list_opa_policies())
    except Exception:
        pass

    compliance_score = 0.0
    try:
        from .compliance_service import check_compliance

        compliance_score = check_compliance()["overall_score"]
    except Exception:
        pass

    return {
        "sast_available": health["sast"] != "unavailable",
        "dependency_scan_available": health["dependency_scan"] != "unavailable",
        "vulnerability_db_available": health["vulnerability_db"] != "unavailable",
        "opa_available": health["opa"] != "unavailable",
        "trivy_available": health["trivy"] != "unavailable",
        "total_issues": total_issues,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "policy_count": policy_count,
        "compliance_score": compliance_score,
    }
