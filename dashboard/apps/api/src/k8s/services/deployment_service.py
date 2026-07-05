from ..services.k8s_service import get_apps_api
from ..services.utils import compute_age


def list_deployments(namespace: str = "") -> list[dict]:
    try:
        api = get_apps_api()
        if namespace:
            deployments = api.list_namespaced_deployment(namespace).items
        else:
            deployments = api.list_deployment_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for d in deployments:
        metadata = d.metadata
        spec = d.spec
        status = d.status

        conditions = status.conditions or []
        available = any(c.type == "Available" and c.status == "True" for c in conditions)
        progressing = any(c.type == "Progressing" and c.status == "True" for c in conditions)

        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "replicas": spec.replicas if spec else 0,
                "ready_replicas": status.ready_replicas or 0,
                "available_replicas": status.available_replicas or 0,
                "unavailable_replicas": status.unavailable_replicas or 0,
                "updated_replicas": status.updated_replicas or 0,
                "strategy": spec.strategy.type if spec and spec.strategy else "RollingUpdate",
                "available": available,
                "progressing": progressing,
                "labels": metadata.labels or {},
                "selector": _get_selector(spec),
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
                "containers": [
                    {
                        "name": c.name,
                        "image": c.image,
                        "image_pull_policy": c.image_pull_policy,
                    }
                    for c in (
                        spec.template.spec.containers
                        if spec and spec.template and spec.template.spec
                        else []
                    )
                ]
                if spec
                else [],
            }
        )
    return results


def _get_selector(spec) -> dict:
    if not spec or not spec.selector:
        return {}
    return spec.selector.match_labels or {}
