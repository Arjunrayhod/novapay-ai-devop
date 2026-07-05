from ..services.k8s_service import get_core_api
from ..services.utils import compute_age

SECURITY_NOTICE = "Secret values are never exposed for security reasons."


def list_secrets(namespace: str = "") -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            secrets = core.list_namespaced_secret(namespace).items
        else:
            secrets = core.list_secret_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for sec in secrets:
        metadata = sec.metadata
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "type": sec.type or "Opaque",
                "data_keys": list(sec.data.keys()) if sec.data else [],
                "data_count": len(sec.data or {}),
                "labels": metadata.labels or {},
                "annotations": _safe_annotations(metadata.annotations),
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
                "notice": SECURITY_NOTICE,
            }
        )
    return results


def _safe_annotations(annotations: dict | None) -> dict:
    if not annotations:
        return {}
    keys_to_omit = {"kubectl.kubernetes.io/last-applied-configuration"}
    return {k: v for k, v in annotations.items() if k not in keys_to_omit}
