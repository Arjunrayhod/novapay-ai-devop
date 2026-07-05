from ..services.k8s_service import get_core_api, get_version_api
from ..services.utils import parse_cpu, parse_memory


def get_cluster_version() -> dict:
    from kubernetes.client import VersionInfo

    try:
        api = get_version_api()
        v: VersionInfo = api.get_code()
        return {
            "major": v.major,
            "minor": v.minor,
            "git_version": v.git_version,
            "git_commit": v.git_commit,
            "git_tree_state": v.git_tree_state,
            "build_date": v.build_date,
            "go_version": v.go_version,
            "compiler": v.compiler,
            "platform": v.platform,
        }
    except Exception:
        return {}


def get_cluster_info() -> dict:
    try:
        core = get_core_api()
        version = get_cluster_version()
        nodes = core.list_node().items
        namespaces = core.list_namespace().items
        pods = core.list_pod_for_all_namespaces().items
        services = core.list_service_for_all_namespaces().items

        total_cpu = 0
        total_memory = 0
        ready_nodes = 0
        for n in nodes:
            status = n.status
            if status and status.conditions:
                ready = any(c.type == "Ready" and c.status == "True" for c in status.conditions)
                if ready:
                    ready_nodes += 1
            if status and status.capacity:
                cpu_str = status.capacity.get("cpu", "0")
                mem_str = status.capacity.get("memory", "0")
                total_cpu += parse_cpu(cpu_str)
                total_memory += parse_memory(mem_str)

        running_pods = sum(1 for p in pods if p.status and p.status.phase == "Running")

        return {
            "version": version,
            "nodes_total": len(nodes),
            "nodes_ready": ready_nodes,
            "namespaces": len(namespaces),
            "pods_total": len(pods),
            "pods_running": running_pods,
            "services": len(services),
            "total_cpu_cores": total_cpu,
            "total_memory_bytes": total_memory,
        }
    except Exception:
        return {
            "version": get_cluster_version(),
            "nodes_total": 0,
            "nodes_ready": 0,
            "namespaces": 0,
            "pods_total": 0,
            "pods_running": 0,
            "services": 0,
            "total_cpu_cores": 0,
            "total_memory_bytes": 0,
        }


def get_cluster_health() -> dict:
    try:
        core = get_core_api()
        nodes = core.list_node().items
    except Exception:
        return {
            "nodes": [],
            "api_server": False,
            "core_dns": False,
            "metrics_server": False,
            "storage_classes": [],
        }

    node_statuses = []
    for n in nodes:
        name = n.metadata.name
        conditions = {c.type: c.status for c in (n.status.conditions or [])}
        ready = conditions.get("Ready") == "True"
        node_statuses.append(
            {
                "name": name,
                "ready": ready,
                "conditions": {c.type: c.status for c in (n.status.conditions or [])},
                "last_heartbeat": _get_last_heartbeat(n),
            }
        )

    api_server_ok = True
    try:
        core_dns_pods = core.list_pod_for_all_namespaces(label_selector="k8s-app=kube-dns").items
        core_dns_ready = (
            all(
                p.status
                and p.status.phase == "Running"
                and all(cs.ready for cs in (p.status.container_statuses or []))
                for p in core_dns_pods
            )
            if core_dns_pods
            else False
        )
    except Exception:
        core_dns_ready = False

    try:
        metrics_server_pods = core.list_pod_for_all_namespaces(
            label_selector="k8s-app=metrics-server"
        ).items
        metrics_server_ready = (
            any(p.status and p.status.phase == "Running" for p in metrics_server_pods)
            if metrics_server_pods
            else False
        )
    except Exception:
        metrics_server_ready = False

    storage_classes = []
    try:
        from kubernetes import client as k8s_client

        storage_api = k8s_client.StorageV1Api()
        sc_list = storage_api.list_storage_class().items
        storage_classes = [sc.metadata.name for sc in sc_list]
    except Exception:
        pass

    return {
        "nodes": node_statuses,
        "api_server": api_server_ok,
        "core_dns": core_dns_ready,
        "metrics_server": metrics_server_ready,
        "storage_classes": storage_classes,
    }


def _get_last_heartbeat(node) -> str | None:
    for condition in node.status.conditions or []:
        if condition.last_heartbeat_time:
            return condition.last_heartbeat_time.isoformat()
    return None
