from ..services.k8s_service import get_apps_api
from ..services.utils import compute_age


def list_statefulsets(namespace: str = "") -> list[dict]:
    try:
        api = get_apps_api()
        if namespace:
            statefulsets = api.list_namespaced_stateful_set(namespace).items
        else:
            statefulsets = api.list_stateful_set_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for s in statefulsets:
        metadata = s.metadata
        spec = s.spec
        status = s.status
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "replicas": spec.replicas if spec else 0,
                "ready_replicas": status.ready_replicas or 0,
                "current_replicas": status.current_replicas or 0,
                "updated_replicas": status.updated_replicas or 0,
                "service_name": spec.service_name if spec else "",
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results
