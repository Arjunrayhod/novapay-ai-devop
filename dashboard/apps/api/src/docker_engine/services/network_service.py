from ..schemas import NetworkInfo
from ..services.docker_service import get_client


def list_networks() -> list[NetworkInfo]:
    client = get_client()
    if not client:
        return []
    networks = client.networks.list()
    result = []
    for n in networks:
        attrs = n.attrs
        ipam = attrs.get("IPAM", {})
        subnet = None
        for config in ipam.get("Config", []):
            subnet = config.get("Subnet")
            if subnet:
                break
        result.append(
            NetworkInfo(
                id=n.id[:12],
                name=n.name,
                driver=attrs.get("Driver", "unknown"),
                scope=attrs.get("Scope", "unknown"),
                subnet=subnet,
                attached_containers=len(attrs.get("Containers", {})),
            )
        )
    return result
