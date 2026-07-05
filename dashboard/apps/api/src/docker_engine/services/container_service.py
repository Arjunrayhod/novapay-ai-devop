from datetime import UTC, datetime

from ..schemas import ContainerInfo
from ..services.docker_service import get_client


def list_containers(all: bool = True) -> list[ContainerInfo]:
    client = get_client()
    if not client:
        return []
    containers = client.containers.list(all=all)
    result = []
    for c in containers:
        attrs = c.attrs
        state = attrs["State"]
        status = state.get("Status", "unknown")
        ports = _format_ports(attrs.get("NetworkSettings", {}).get("Ports", {}))
        created_raw = attrs.get("Created", "")
        created = _format_time(created_raw)
        uptime = _calc_uptime(created_raw)
        health = state.get("Health", {}).get("Status") if "Health" in state else None
        result.append(
            ContainerInfo(
                id=c.id[:12],
                name=c.name,
                image=c.image.tags[0] if c.image.tags else c.image.short_id,
                status=status,
                state=state.get("Status", "unknown"),
                ports=ports,
                created=created,
                uptime=uptime,
                restart_count=attrs.get("RestartCount", 0),
                health=health,
            )
        )
    return result


def get_container(container_id: str) -> ContainerInfo | None:
    client = get_client()
    if not client:
        return None
    try:
        c = client.containers.get(container_id)
    except Exception:
        return None
    attrs = c.attrs
    state = attrs["State"]
    status = state.get("Status", "unknown")
    ports = _format_ports(attrs.get("NetworkSettings", {}).get("Ports", {}))
    created_raw = attrs.get("Created", "")
    created = _format_time(created_raw)
    uptime = _calc_uptime(created_raw)
    health = state.get("Health", {}).get("Status") if "Health" in state else None
    return ContainerInfo(
        id=c.id[:12],
        name=c.name,
        image=c.image.tags[0] if c.image.tags else c.image.short_id,
        status=status,
        state=state.get("Status", "unknown"),
        ports=ports,
        created=created,
        uptime=uptime,
        restart_count=attrs.get("RestartCount", 0),
        health=health,
    )


def _format_ports(ports_dict: dict) -> str:
    parts = []
    for container_port, bindings in ports_dict.items():
        if bindings:
            for b in bindings:
                host_port = b.get("HostPort", "")
                parts.append(f"{host_port}->{container_port}")
        else:
            parts.append(container_port)
    return ", ".join(parts) if parts else "—"


def _format_time(iso_str: str) -> str:
    if not iso_str:
        return "—"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return iso_str[:19]


def _calc_uptime(iso_str: str) -> str:
    if not iso_str:
        return "—"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        now = datetime.now(UTC)
        delta = now - dt
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        if days > 0:
            return f"{days}d {hours}h"
        return f"{hours}h {minutes}m"
    except Exception:
        return "—"
