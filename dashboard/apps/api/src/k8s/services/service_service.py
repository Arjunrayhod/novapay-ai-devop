from ..services.k8s_service import get_core_api
from ..services.utils import compute_age


def list_services(namespace: str = "") -> list[dict]:
    try:
        core = get_core_api()
        if namespace:
            services = core.list_namespaced_service(namespace).items
        else:
            services = core.list_service_for_all_namespaces().items
    except Exception:
        return []
    results = []
    for svc in services:
        metadata = svc.metadata
        spec = svc.spec
        ports = []
        for p in spec.ports or []:
            port_str = f"{p.port}/{p.protocol}" if p.protocol else str(p.port)
            if p.node_port:
                port_str += f":{p.node_port}"
            ports.append(port_str)

        results.append(
            {
                "name": metadata.name,
                "namespace": metadata.namespace,
                "type": spec.type if spec else "ClusterIP",
                "cluster_ip": spec.cluster_ip if spec else "",
                "cluster_ips": spec.cluster_ips or [],
                "external_ip": _get_external_ips(spec),
                "external_traffic_policy": spec.external_traffic_policy if spec else "",
                "ports": ports,
                "selector": spec.selector or {} if spec else {},
                "labels": metadata.labels or {},
                "created": metadata.creation_timestamp.isoformat()
                if metadata.creation_timestamp
                else "",
                "age": compute_age(metadata.creation_timestamp),
            }
        )
    return results


def _get_external_ips(spec) -> list[str]:
    if not spec:
        return []
    result = []
    if spec.external_ips:
        result.extend(spec.external_ips)
    if spec.load_balancer_ip:
        result.append(spec.load_balancer_ip)
    if spec.load_balancer_source_ranges:
        result.extend(spec.load_balancer_source_ranges)
    return result
