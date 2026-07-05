from datetime import UTC, datetime

from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_events(namespace: str = "", limit: int = 100) -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            events = core.list_namespaced_event(namespace).items
        else:
            events = core.list_event_for_all_namespaces().items
    except Exception:
        return []

    sorted_events = sorted(
        events,
        key=lambda e: (
            e.last_timestamp
            or e.event_time
            or e.metadata.creation_timestamp
            or datetime.min.replace(tzinfo=UTC)
        ),
        reverse=True,
    )[:limit]

    results = []
    for ev in sorted_events:
        metadata = ev.metadata
        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "type": ev.type or "Normal",
                "reason": ev.reason or "",
                "message": ev.message or "",
                "source": {
                    "component": ev.source.component if ev.source else "",
                    "host": ev.source.host if ev.source else "",
                },
                "involved_object": {
                    "kind": ev.involved_object.kind if ev.involved_object else "",
                    "name": ev.involved_object.name if ev.involved_object else "",
                    "namespace": ev.involved_object.namespace if ev.involved_object else "",
                    "api_version": ev.involved_object.api_version if ev.involved_object else "",
                },
                "count": ev.count or 0,
                "first_seen": ev.first_timestamp.isoformat() if ev.first_timestamp else "",
                "last_seen": ev.last_timestamp.isoformat() if ev.last_timestamp else "",
                "age": compute_age(ev.last_timestamp or ev.metadata.creation_timestamp),
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
            }
        )
    return results
