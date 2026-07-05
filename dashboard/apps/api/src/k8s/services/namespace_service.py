from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_namespaces() -> list[dict]:
    try:
        core = get_core_api()
        namespaces = core.list_namespace().items
    except Exception:
        return []
    results = []
    for ns in namespaces:
        metadata = ns.metadata
        status = ns.status
        phase = status.phase if status else "Unknown"
        results.append(
            {
                "name": metadata.name,
                "status": phase,
                "labels": metadata.labels or {},
                "annotations": _safe_annotations(metadata.annotations),
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results


def _safe_annotations(annotations: dict | None) -> dict:
    if not annotations:
        return {}
    keys_to_omit = {"kubectl.kubernetes.io/last-applied-configuration"}
    return {k: v for k, v in annotations.items() if k not in keys_to_omit}
