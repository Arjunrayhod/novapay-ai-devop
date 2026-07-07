from ...docker_engine.services.health_service import get_docker_info
from ...helm_center.services.health_service import get_helm_health
from ...k8s.services.health_service import get_kubernetes_health
from ...observability.services.health_service import get_observability_health
from ...observability.services.prometheus_service import list_alerts
from ...security_center.services.health_service import get_security_health, get_security_overview
from ...terraform_center.services.health_service import get_terraform_health
from ..schemas import Recommendation


def generate_recommendations() -> list[Recommendation]:
    recommendations: list[Recommendation] = []
    idx = 0

    docker_info = get_docker_info()
    if docker_info and getattr(docker_info, "containers_running", 0) > 0:
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="reliability",
                severity="medium",
                title="Review Docker Resource Limits",
                description=(
                    "Check that running containers have appropriate CPU "
                    "and memory limits configured to prevent resource starvation."
                ),
                module="docker",
                impact=(
                    "Running containers without limits may cause instability during traffic spikes."
                ),
            )
        )

    k8s_health = get_kubernetes_health()
    if k8s_health and not getattr(k8s_health, "connected", False):
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="infrastructure",
                severity="high",
                title="Kubernetes Cluster Not Connected",
                description=(
                    "The Kubernetes cluster is not accessible. "
                    "Verify kubeconfig and cluster status."
                ),
                module="kubernetes",
                impact="Unable to monitor or manage Kubernetes resources through the platform.",
            )
        )

    if not get_helm_health() or not getattr(get_helm_health(), "available", False):
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="tooling",
                severity="medium",
                title="Install Helm CLI",
                description=(
                    "Helm is not available. Install Helm to enable "
                    "release management and chart deployments."
                ),
                module="helm",
                impact="Helm-based deployments and release management are unavailable.",
            )
        )

    tf_health = get_terraform_health()
    if tf_health and not getattr(tf_health, "available", False):
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="tooling",
                severity="medium",
                title="Install Terraform CLI",
                description="Terraform is not available. Install Terraform for IaC management.",
                module="terraform",
                impact="Infrastructure as Code management is unavailable through this platform.",
            )
        )

    obs_health = get_observability_health()
    if obs_health:
        unhealthy = [k for k, v in obs_health.items() if v != "healthy"]
        if unhealthy:
            idx += 1
            recommendations.append(
                Recommendation(
                    id=f"rec-{idx}",
                    category="observability",
                    severity="high",
                    title=f"Unhealthy Observability Components: {', '.join(unhealthy)}",
                    description=(
                        f"The following observability services need attention: "
                        f"{', '.join(unhealthy)}. Check service status and connectivity."
                    ),
                    module="observability",
                    impact="Monitoring gaps may prevent detection of production issues.",
                )
            )

    alerts = list_alerts() or []
    if len(alerts) > 0:
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="reliability",
                severity="high"
                if any(a.get("severity") == "critical" for a in alerts)
                else "medium",
                title=f"Address {len(alerts)} Active Alert(s)",
                description=(
                    "Review and address active Prometheus alerts to prevent service degradation."
                ),
                module="observability",
                impact="Unresolved alerts may indicate ongoing or imminent issues.",
            )
        )

    sec_health = get_security_health()
    if sec_health:
        unavailable = [k for k, v in sec_health.items() if v == "unavailable"]
        if unavailable:
            idx += 1
            recommendations.append(
                Recommendation(
                    id=f"rec-{idx}",
                    category="security",
                    severity="high",
                    title="Install Missing Security Tools",
                    description=(
                        f"The following security tools are not installed: "
                        f"{', '.join(unavailable)}. Install them to enable security scanning."
                    ),
                    module="security",
                    impact="Security vulnerabilities may go undetected without complete tooling.",
                )
            )

    sec_overview = get_security_overview()
    if sec_overview:
        total_issues = (
            getattr(sec_overview, "total_issues", 0) if hasattr(sec_overview, "total_issues") else 0
        )
        if total_issues > 0:
            idx += 1
            recommendations.append(
                Recommendation(
                    id=f"rec-{idx}",
                    category="security",
                    severity="high",
                    title=f"Remediate {total_issues} Security Issues",
                    description=(
                        "Security scans have detected issues that require attention. "
                        "Review and fix them to improve security posture."
                    ),
                    module="security",
                    impact="Unfixed security issues increase the attack surface of the platform.",
                )
            )

    if not recommendations:
        idx += 1
        recommendations.append(
            Recommendation(
                id=f"rec-{idx}",
                category="info",
                severity="low",
                title="No Recommendations Available",
                description=(
                    "I don't have enough platform data to generate recommendations. "
                    "Ensure that platform modules are operational."
                ),
                impact="",
            )
        )

    return recommendations
