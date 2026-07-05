from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_persistent_volumes() -> list[dict]:
    try:
        core = get_core_api()
        pvs = core.list_persistent_volume().items
    except Exception:
        return []
    results = []
    for pv in pvs:
        metadata = pv.metadata
        spec = pv.spec
        status = pv.status
        results.append(
            {
                "name": metadata.name,
                "capacity": _get_capacity(spec),
                "storage_class": spec.storage_class_name or "",
                "access_modes": spec.access_modes or [],
                "reclaim_policy": spec.persistent_volume_reclaim_policy or "",
                "status": status.phase if status else "Unknown",
                "claim": _get_claim_ref(spec),
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results


def list_persistent_volume_claims(namespace: str = "") -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            pvcs = core.list_namespaced_persistent_volume_claim(namespace).items
        else:
            pvcs = core.list_persistent_volume_claim_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for pvc in pvcs:
        metadata = pvc.metadata
        spec = pvc.spec
        status = pvc.status
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "status": status.phase if status else "Unknown",
                "storage_class": spec.storage_class_name or "",
                "access_modes": spec.access_modes or [],
                "capacity": _get_capacity_from_status(status),
                "volume_name": spec.volume_name or "",
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results


def _get_capacity(spec) -> str:
    if not spec or not spec.capacity:
        return ""
    storage = spec.capacity.get("storage", "")
    return str(storage)


def _get_capacity_from_status(status) -> str:
    if not status or not status.capacity:
        return ""
    storage = status.capacity.get("storage", "")
    return str(storage)


def _get_claim_ref(spec) -> str:
    if not spec or not spec.claim_ref:
        return ""
    return f"{spec.claim_ref.namespace}/{spec.claim_ref.name}"
