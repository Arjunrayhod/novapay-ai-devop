from ..services.k8s_service import get_core_api, get_custom_objects_api
from ..services.utils import parse_cpu, parse_memory


def get_pod_metrics(namespace: str = "") -> list[dict]:
    api = get_custom_objects_api()
    try:
        if namespace:
            metrics = api.list_namespaced_custom_object(
                group="metrics.k8s.io",
                version="v1beta1",
                namespace=namespace,
                plural="pods",
            )
        else:
            metrics = api.list_cluster_custom_object(
                group="metrics.k8s.io",
                version="v1beta1",
                plural="pods",
            )
    except Exception:
        return []

    results = []
    for item in metrics.get("items", []):
        metadata = item.get("metadata", {})
        containers = item.get("containers", [])
        total_cpu = 0
        total_memory = 0
        for c in containers:
            usage = c.get("usage", {})
            total_cpu += parse_cpu(usage.get("cpu", "0"))
            total_memory += parse_memory(usage.get("memory", "0"))

        results.append(
            {
                "name": metadata.get("name", ""),
                "namespace": metadata.get("namespace", ""),
                "cpu_millicores": total_cpu,
                "memory_bytes": total_memory,
                "containers": [
                    {
                        "name": c.get("name", ""),
                        "cpu_millicores": parse_cpu(c.get("usage", {}).get("cpu", "0")),
                        "memory_bytes": parse_memory(c.get("usage", {}).get("memory", "0")),
                    }
                    for c in containers
                ],
            }
        )
    return results


def get_node_metrics() -> list[dict]:
    api = get_custom_objects_api()
    try:
        metrics = api.list_cluster_custom_object(
            group="metrics.k8s.io",
            version="v1beta1",
            plural="nodes",
        )
    except Exception:
        return []

    results = []
    for item in metrics.get("items", []):
        metadata = item.get("metadata", {})
        usage = item.get("usage", {})
        results.append(
            {
                "name": metadata.get("name", ""),
                "cpu_millicores": parse_cpu(usage.get("cpu", "0")),
                "memory_bytes": parse_memory(usage.get("memory", "0")),
            }
        )
    return results


def get_cluster_metrics() -> dict:
    pod_metrics = get_pod_metrics()
    node_metrics = get_node_metrics()

    total_pod_cpu = sum(p["cpu_millicores"] for p in pod_metrics)
    total_pod_memory = sum(p["memory_bytes"] for p in pod_metrics)
    total_node_cpu = sum(n["cpu_millicores"] for n in node_metrics)
    total_node_memory = sum(n["memory_bytes"] for n in node_metrics)

    try:
        core = get_core_api()
        nodes = core.list_node().items
    except Exception:
        nodes = []
    total_capacity_cpu = 0
    total_capacity_memory = 0
    for n in nodes:
        capacity = n.status.capacity or {}
        total_capacity_cpu += parse_cpu(str(capacity.get("cpu", "0")))
        total_capacity_memory += parse_memory(str(capacity.get("memory", "0")))

    cpu_percent = (
        round((total_node_cpu / total_capacity_cpu * 100), 1) if total_capacity_cpu > 0 else 0
    )
    memory_percent = (
        round((total_node_memory / total_capacity_memory * 100), 1)
        if total_capacity_memory > 0
        else 0
    )

    return {
        "pod_count": len(pod_metrics),
        "total_pod_cpu_millicores": total_pod_cpu,
        "total_pod_memory_bytes": total_pod_memory,
        "total_node_cpu_millicores": total_node_cpu,
        "total_node_memory_bytes": total_node_memory,
        "total_capacity_cpu_millicores": total_capacity_cpu,
        "total_capacity_memory_bytes": total_capacity_memory,
        "cpu_utilization_percent": cpu_percent,
        "memory_utilization_percent": memory_percent,
        "metrics_available": len(node_metrics) > 0,
    }
