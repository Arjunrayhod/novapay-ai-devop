from ..schemas import ContainerStats
from ..services.docker_service import get_client


def get_all_stats() -> list[ContainerStats]:
    client = get_client()
    if not client:
        return []
    containers = client.containers.list(all=False)
    result = []
    for c in containers:
        try:
            stats = c.stats(stream=False)
            cpu_percent = _calc_cpu(stats)
            mem_stats = stats.get("memory_stats", {})
            mem_usage = mem_stats.get("usage", 0)
            mem_limit = mem_stats.get("limit", 1)
            mem_percent = (mem_usage / mem_limit * 100) if mem_limit > 0 else 0
            net = stats.get("networks", {})
            net_rx = sum(n.get("rx_bytes", 0) for n in net.values())
            net_tx = sum(n.get("tx_bytes", 0) for n in net.values())
            blk = stats.get("blkio_stats", {}).get("io_service_bytes_recursive", [])
            disk_read = sum(b.get("value", 0) for b in blk if b.get("op") == "read")
            disk_write = sum(b.get("value", 0) for b in blk if b.get("op") == "write")
            result.append(
                ContainerStats(
                    container_id=c.id[:12],
                    container_name=c.name,
                    cpu_percent=cpu_percent,
                    memory_percent=round(mem_percent, 1),
                    memory_usage=mem_usage,
                    memory_limit=mem_limit,
                    network_rx=net_rx,
                    network_tx=net_tx,
                    disk_read=disk_read,
                    disk_write=disk_write,
                )
            )
        except Exception:
            continue
    return result


def _calc_cpu(stats: dict) -> float:
    cpu = stats.get("cpu_stats", {})
    precpu = stats.get("precpu_stats", {})
    cpu_delta = cpu.get("cpu_usage", {}).get("total_usage", 0) - precpu.get("cpu_usage", {}).get(
        "total_usage", 0
    )
    system_delta = cpu.get("system_cpu_usage", 0) - precpu.get("system_cpu_usage", 0)
    num_cpus = cpu.get("online_cpus", 1)
    if system_delta > 0 and cpu_delta > 0:
        return round((cpu_delta / system_delta) * num_cpus * 100.0, 1)
    return 0.0
