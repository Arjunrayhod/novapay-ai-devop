from ..services.k8s_service import get_networking_api
from ..services.utils import compute_age


def list_ingresses(namespace: str = "") -> list[dict]:
    try:
        api = get_networking_api()
        if namespace:
            ingresses = api.list_namespaced_ingress(namespace).items
        else:
            ingresses = api.list_ingress_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for ing in ingresses:
        metadata = ing.metadata
        spec = ing.spec

        rules = []
        for rule in spec.rules or []:
            rule_info = {
                "host": rule.host or "",
                "paths": [],
            }
            if rule.http and rule.http.paths:
                for path in rule.http.paths:
                    rule_info["paths"].append(
                        {
                            "path": path.path,
                            "path_type": path.path_type,
                            "service_name": path.backend.service.name
                            if path.backend and path.backend.service
                            else "",
                            "service_port": path.backend.service.port.number
                            if path.backend and path.backend.service and path.backend.service.port
                            else "",
                        }
                    )
            rules.append(rule_info)

        tls = []
        for t in spec.tls or []:
            tls.append(
                {
                    "hosts": t.hosts or [],
                    "secret_name": t.secret_name or "",
                }
            )

        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "class_name": spec.ingress_class_name or "",
                "rules": rules,
                "tls": tls,
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results
