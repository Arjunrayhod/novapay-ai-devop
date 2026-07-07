from ..services.cluster_service import get_cluster_health
from ..services.k8s_service import get_version_api, is_kubernetes_available


def get_kubernetes_health() -> dict:
    available = is_kubernetes_available()
    if not available:
        return {
            "status": "unavailable",
            "message": (
                "Kubernetes cluster is not accessible. "
                "Check kubeconfig or in-cluster configuration."
            ),
            "components": {
                "api_server": False,
                "nodes": False,
                "core_dns": False,
                "metrics_server": False,
            },
        }

    try:
        cluster_health = get_cluster_health()
        version_api = get_version_api()
        version = version_api.get_code()

        all_nodes_ready = all(n["ready"] for n in cluster_health["nodes"])

        components = {
            "api_server": True,
            "nodes": all_nodes_ready,
            "core_dns": cluster_health["core_dns"],
            "metrics_server": cluster_health["metrics_server"],
        }

        healthy_count = sum(1 for v in components.values() if v)
        total_count = len(components)
        health_percent = round((healthy_count / total_count) * 100, 1)

        return {
            "status": "healthy"
            if health_percent == 100
            else "degraded"
            if health_percent >= 50
            else "unhealthy",
            "message": _get_health_message(health_percent, components),
            "health_percent": health_percent,
            "version": version.git_version if version else "unknown",
            "nodes": cluster_health["nodes"],
            "components": components,
            "storage_classes": cluster_health["storage_classes"],
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error checking cluster health: {str(e)}",
            "components": {
                "api_server": False,
                "nodes": False,
                "core_dns": False,
                "metrics_server": False,
            },
        }


def _get_health_message(percent: float, components: dict) -> str:
    if percent == 100:
        return "All components are healthy."
    unhealthy = [k for k, v in components.items() if not v]
    return f"Degraded: {', '.join(unhealthy)} not ready."
