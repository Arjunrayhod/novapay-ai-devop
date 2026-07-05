from datetime import UTC, datetime


def compute_age(creation_timestamp) -> str:
    if not creation_timestamp:
        return ""
    now = datetime.now(UTC)
    age = now - creation_timestamp
    days = age.days
    hours = age.seconds // 3600
    minutes = (age.seconds // 60) % 60
    if days > 0:
        return f"{days}d"
    if hours > 0:
        return f"{hours}h"
    return f"{minutes}m"


def parse_cpu(cpu_str: str) -> int:
    if not cpu_str:
        return 0
    cpu_str = str(cpu_str)
    if cpu_str.endswith("m"):
        return int(cpu_str[:-1])
    return int(cpu_str) * 1000


def parse_memory(mem_str: str) -> int:
    if not mem_str:
        return 0
    mem_str = str(mem_str).strip()
    if mem_str.endswith("Ki"):
        return int(mem_str[:-2]) * 1024
    elif mem_str.endswith("Mi"):
        return int(mem_str[:-2]) * 1024 * 1024
    elif mem_str.endswith("Gi"):
        return int(mem_str[:-2]) * 1024 * 1024 * 1024
    elif mem_str.endswith("Ti"):
        return int(mem_str[:-2]) * 1024 * 1024 * 1024 * 1024
    elif mem_str.endswith("k"):
        return int(mem_str[:-1]) * 1000
    elif mem_str.endswith("M"):
        return int(mem_str[:-1]) * 1000 * 1000
    elif mem_str.endswith("G"):
        return int(mem_str[:-1]) * 1000 * 1000 * 1000
    elif mem_str.endswith("T"):
        return int(mem_str[:-1]) * 1000 * 1000 * 1000 * 1000
    try:
        return int(mem_str)
    except ValueError:
        return 0
