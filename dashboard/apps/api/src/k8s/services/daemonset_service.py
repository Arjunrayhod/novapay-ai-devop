from ..services.k8s_service import get_apps_api
from ..services.utils import compute_age


def list_daemonsets(namespace: str = "") -> list[dict]:
    try:
        api = get_apps_api()
        if namespace:
            daemonsets = api.list_namespaced_daemon_set(namespace).items
        else:
            daemonsets = api.list_daemon_set_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for ds in daemonsets:
        metadata = ds.metadata
        spec = ds.spec
        status = ds.status
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "desired_scheduled": status.desired_number_scheduled or 0,
                "current_scheduled": status.current_number_scheduled or 0,
                "ready": status.number_ready or 0,
                "available": status.number_available or 0,
                "updated": status.updated_number_scheduled or 0,
                "strategy": spec.update_strategy.type
                if spec and spec.update_strategy
                else "RollingUpdate",
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results
