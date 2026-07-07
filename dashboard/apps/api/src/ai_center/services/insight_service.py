from ...docker_engine.services.health_service import get_docker_info
from ...helm_center.services.health_service import get_helm_health
from ...k8s.services.health_service import get_kubernetes_health
from ...observability.services.health_service import (
    get_observability_health,
)
from ...observability.services.prometheus_service import list_alerts
from ...security_center.services.health_service import get_security_health, get_security_overview
from ...terraform_center.services.health_service import get_terraform_health
from ..schemas import Insight


def generate_insights() -> list[Insight]:
    insights: list[Insight] = []
    idx = 0

    docker_info = get_docker_info()
    if docker_info:
        idx += 1
        containers_running = getattr(docker_info, "containers_running", 0)
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="docker",
                title="Docker Engine Status",
                summary=f"Docker is connected with {containers_running} running containers",
                module="docker",
                severity="info",
            )
        )

    k8s_health = get_kubernetes_health()
    if k8s_health:
        idx += 1
        status = "healthy" if getattr(k8s_health, "connected", False) else "unavailable"
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="kubernetes",
                title="Kubernetes Cluster Health",
                summary=f"Cluster is {status}"
                if status == "healthy"
                else "Cluster is not accessible",
                module="kubernetes",
                severity="success" if status == "healthy" else "warning",
            )
        )

    helm_health = get_helm_health()
    if helm_health:
        idx += 1
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="helm",
                title="Helm Status",
                summary=(
                    "Helm is available"
                    if getattr(helm_health, "available", False)
                    else "Helm is unavailable"
                ),
                module="helm",
                severity="info",
            )
        )

    tf_health = get_terraform_health()
    if tf_health:
        idx += 1
        tf_available = getattr(tf_health, "available", False)
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="terraform",
                title="Terraform Status",
                summary=f"Terraform is {'available' if tf_available else 'unavailable'}",
                module="terraform",
                severity="info",
            )
        )

    obs_health = get_observability_health()
    if obs_health:
        unhealthy = [k for k, v in obs_health.items() if v != "healthy"]
        if unhealthy:
            idx += 1
            insights.append(
                Insight(
                    id=f"insight-{idx}",
                    type="observability",
                    title="Observability Degradation",
                    summary=f"Unhealthy components: {', '.join(unhealthy)}",
                    details="One or more observability services are not healthy",
                    module="observability",
                    severity="warning",
                )
            )
        else:
            idx += 1
            insights.append(
                Insight(
                    id=f"insight-{idx}",
                    type="observability",
                    title="Observability Health",
                    summary="All observability services are healthy",
                    module="observability",
                    severity="success",
                )
            )

    alerts = list_alerts() or []
    if alerts:
        idx += 1
        critical_count = sum(1 for a in alerts if a.get("severity") == "critical")
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="alert",
                title="Active Prometheus Alerts",
                summary=f"{len(alerts)} active alert(s), {critical_count} critical",
                details=f"There are {len(alerts)} active Prometheus alerts requiring attention",
                module="observability",
                severity="critical" if critical_count > 0 else "warning",
            )
        )

    sec_health = get_security_health()
    if sec_health:
        unavailable = [k for k, v in sec_health.items() if v == "unavailable"]
        if unavailable:
            idx += 1
            insights.append(
                Insight(
                    id=f"insight-{idx}",
                    type="security",
                    title="Security Tooling Gaps",
                    summary=f"Unavailable security tools: {', '.join(unavailable)}",
                    module="security",
                    severity="warning",
                )
            )

    sec_overview = get_security_overview()
    if sec_overview:
        total_issues = (
            getattr(sec_overview, "total_issues", 0) if hasattr(sec_overview, "total_issues") else 0
        )
        if total_issues > 0:
            idx += 1
            insights.append(
                Insight(
                    id=f"insight-{idx}",
                    type="security",
                    title="Security Issues Found",
                    summary=f"{total_issues} total security issues detected",
                    module="security",
                    severity="warning",
                )
            )

    if not insights:
        idx += 1
        insights.append(
            Insight(
                id=f"insight-{idx}",
                type="info",
                title="No Platform Data Available",
                summary=(
                    "I don't have enough data to generate insights. "
                    "Ensure platform modules are running."
                ),
                severity="info",
            )
        )

    return insights
