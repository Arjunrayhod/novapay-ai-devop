from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_pods(namespace: str = "") -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            pods = core.list_namespaced_pod(namespace).items
        else:
            pods = core.list_pod_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for p in pods:
        metadata = p.metadata
        status = p.status
        spec = p.spec

        phase = status.phase if status else "Unknown"
        container_statuses = status.container_statuses or []

        restart_count = sum(cs.restart_count for cs in container_statuses)
        ready_count = sum(1 for cs in container_statuses if cs.ready)
        total_containers = len(container_statuses)

        reason = _get_pod_reason(status, container_statuses)

        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "status": phase,
                "reason": reason,
                "restart_count": restart_count,
                "ready_containers": ready_count,
                "total_containers": total_containers,
                "node_name": spec.node_name if spec else "",
                "host_ip": status.host_ip if status else "",
                "pod_ip": status.pod_ip if status else "",
                "qos_class": status.qos_class if status else "",
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
                "containers": [
                    {
                        "name": c.name,
                        "image": c.image,
                        "ready": c.ready,
                        "restart_count": c.restart_count,
                        "state": _get_container_state(c.state),
                        "state_reason": _get_container_state_reason(c.state),
                    }
                    for c in container_statuses
                ],
            }
        )
    return results


def _get_pod_reason(status, container_statuses) -> str:
    if not status:
        return ""
    if status.reason:
        return status.reason
    for cs in container_statuses:
        if cs.state and cs.state.waiting:
            return cs.state.waiting.reason or ""
        if cs.state and cs.state.terminated:
            return cs.state.terminated.reason or ""
    return ""


def _get_container_state(state) -> str:
    if not state:
        return "unknown"
    if state.running:
        return "running"
    if state.waiting:
        return "waiting"
    if state.terminated:
        return "terminated"
    return "unknown"


def _get_container_state_reason(state) -> str | None:
    if not state:
        return None
    if state.waiting:
        return state.waiting.reason
    if state.terminated:
        return state.terminated.reason
    return None
