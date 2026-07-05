from ..services.k8s_service import get_core_api
from ..services.utils import compute_age, parse_cpu, parse_memory


def list_nodes() -> list[dict]:
    try:
        core = get_core_api()
        nodes = core.list_node().items
    except Exception:
        return []
    results = []
    for n in nodes:
        metadata = n.metadata
        status = n.status
        spec = n.spec

        labels = metadata.labels or {}
        roles = []
        for k in labels:
            if k.startswith("node-role.kubernetes.io/"):
                role = k.split("/")[-1]
                roles.append(role)
        if not roles:
            roles.append("worker")

        capacity = status.capacity or {}
        allocatable = status.allocatable or {}

        conditions = status.conditions or []
        ready_condition = next((c for c in conditions if c.type == "Ready"), None)
        status_str = "Ready" if ready_condition and ready_condition.status == "True" else "NotReady"

        node_info = status.node_info or {}

        pods = _count_pods_on_node(metadata.name)

        age = compute_age(metadata.creation_timestamp)

        results.append(
            {
                "name": metadata.name,
                "roles": roles,
                "status": status_str,
                "cpu_capacity": parse_cpu(capacity.get("cpu", "0")),
                "cpu_allocatable": parse_cpu(allocatable.get("cpu", "0")),
                "memory_capacity": parse_memory(capacity.get("memory", "0")),
                "memory_allocatable": parse_memory(allocatable.get("memory", "0")),
                "pods_capacity": int(capacity.get("pods", 0)),
                "pods_allocated": pods,
                "age": age,
                "kernel_version": node_info.get("kernel_version", ""),
                "os_image": node_info.get("os_image", ""),
                "container_runtime": node_info.get("container_runtime_version", ""),
                "kubelet_version": node_info.get("kubelet_version", ""),
                "kube_proxy_version": node_info.get("kube_proxy_version", ""),
                "architecture": node_info.get("architecture", ""),
                "operating_system": node_info.get("operating_system", ""),
                "internal_ip": _get_internal_ip(status),
                "external_ip": _get_external_ip(status),
                "labels": labels,
                "taints": [
                    {"key": t.key, "value": t.value, "effect": t.effect}
                    for t in (spec.taints or [])
                ],
            }
        )
    return results


def _count_pods_on_node(node_name: str) -> int:
    try:
        core = get_core_api()
        pods = core.list_pod_for_all_namespaces(field_selector=f"spec.nodeName={node_name}").items
        return len(pods)
    except Exception:
        return 0


def _get_internal_ip(status) -> str:
    for addr in status.addresses or []:
        if addr.type == "InternalIP":
            return addr.address
    return ""


def _get_external_ip(status) -> str:
    for addr in status.addresses or []:
        if addr.type == "ExternalIP":
            return addr.address
    return ""
