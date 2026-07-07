from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_configmaps(namespace: str = "") -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            configmaps = core.list_namespaced_config_map(namespace).items
        else:
            configmaps = core.list_config_map_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for cm in configmaps:
        metadata = cm.metadata
        data = cm.data or {}
        binary_data = cm.binary_data or {}
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "data_count": len(data),
                "binary_data_count": len(binary_data),
                "total_keys": len(data) + len(binary_data),
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results
