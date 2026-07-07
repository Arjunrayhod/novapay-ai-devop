from pydantic import BaseModel


class NodeInfo(BaseModel):
    name: str
    roles: list[str]
    status: str
    cpu_capacity: int
    cpu_allocatable: int
    memory_capacity: int
    memory_allocatable: int
    pods_capacity: int
    pods_allocated: int
    age: str
    kernel_version: str
    os_image: str
    container_runtime: str
    kubelet_version: str
    kube_proxy_version: str
    architecture: str
    operating_system: str
    internal_ip: str
    external_ip: str
    labels: dict = {}
    taints: list[dict] = []


class NamespaceInfo(BaseModel):
    name: str
    status: str
    labels: dict = {}
    annotations: dict = {}
    created: str = ""
    age: str = ""


class ContainerInfo(BaseModel):
    name: str
    image: str
    ready: bool
    restart_count: int
    state: str
    state_reason: str | None = None


class PodInfo(BaseModel):
    name: str
    namespace: str
    status: str
    reason: str = ""
    restart_count: int
    ready_containers: int
    total_containers: int
    node_name: str = ""
    host_ip: str = ""
    pod_ip: str = ""
    qos_class: str = ""
    labels: dict = {}
    created: str = ""
    age: str = ""
    containers: list[ContainerInfo] = []


class DeploymentInfo(BaseModel):
    name: str
    namespace: str
    replicas: int
    ready_replicas: int
    available_replicas: int
    unavailable_replicas: int
    updated_replicas: int
    strategy: str = "RollingUpdate"
    available: bool = False
    progressing: bool = False
    labels: dict = {}
    selector: dict = {}
    created: str = ""
    age: str = ""
    containers: list[dict] = []


class DaemonSetInfo(BaseModel):
    name: str
    namespace: str
    desired_scheduled: int
    current_scheduled: int
    ready: int
    available: int
    updated: int
    strategy: str = "RollingUpdate"
    labels: dict = {}
    created: str = ""
    age: str = ""


class StatefulSetInfo(BaseModel):
    name: str
    namespace: str
    replicas: int
    ready_replicas: int
    current_replicas: int
    updated_replicas: int
    service_name: str = ""
    labels: dict = {}
    created: str = ""
    age: str = ""


class ServiceInfo(BaseModel):
    name: str
    namespace: str
    type: str = "ClusterIP"
    cluster_ip: str = ""
    cluster_ips: list[str] = []
    external_ip: list[str] = []
    external_traffic_policy: str = ""
    ports: list[str] = []
    selector: dict = {}
    labels: dict = {}
    created: str = ""
    age: str = ""


class IngressInfo(BaseModel):
    name: str
    namespace: str
    class_name: str = ""
    rules: list[dict] = []
    tls: list[dict] = []
    labels: dict = {}
    created: str = ""
    age: str = ""


class ConfigMapInfo(BaseModel):
    name: str
    namespace: str
    data_count: int = 0
    binary_data_count: int = 0
    total_keys: int = 0
    labels: dict = {}
    created: str = ""
    age: str = ""


class SecretInfo(BaseModel):
    name: str
    namespace: str
    type: str = "Opaque"
    data_keys: list[str] = []
    data_count: int = 0
    labels: dict = {}
    annotations: dict = {}
    created: str = ""
    age: str = ""
    notice: str = ""


class PersistentVolumeInfo(BaseModel):
    name: str
    capacity: str = ""
    storage_class: str = ""
    access_modes: list[str] = []
    reclaim_policy: str = ""
    status: str = "Unknown"
    claim: str = ""
    labels: dict = {}
    created: str = ""
    age: str = ""


class PersistentVolumeClaimInfo(BaseModel):
    name: str
    namespace: str
    status: str = "Unknown"
    storage_class: str = ""
    access_modes: list[str] = []
    capacity: str = ""
    volume_name: str = ""
    labels: dict = {}
    created: str = ""
    age: str = ""


class EventInfo(BaseModel):
    name: str
    namespace: str
    type: str = "Normal"
    reason: str = ""
    message: str = ""
    source: dict = {}
    involved_object: dict = {}
    count: int = 0
    first_seen: str = ""
    last_seen: str = ""
    age: str = ""
    created: str = ""


class PodMetric(BaseModel):
    name: str
    namespace: str
    cpu_millicores: int = 0
    memory_bytes: int = 0
    containers: list[dict] = []


class NodeMetric(BaseModel):
    name: str
    cpu_millicores: int = 0
    memory_bytes: int = 0


class ClusterMetrics(BaseModel):
    pod_count: int = 0
    total_pod_cpu_millicores: int = 0
    total_pod_memory_bytes: int = 0
    total_node_cpu_millicores: int = 0
    total_node_memory_bytes: int = 0
    total_capacity_cpu_millicores: int = 0
    total_capacity_memory_bytes: int = 0
    cpu_utilization_percent: float = 0
    memory_utilization_percent: float = 0
    metrics_available: bool = False


class ClusterInfo(BaseModel):
    version: dict = {}
    nodes_total: int = 0
    nodes_ready: int = 0
    namespaces: int = 0
    pods_total: int = 0
    pods_running: int = 0
    services: int = 0
    total_cpu_cores: int = 0
    total_memory_bytes: int = 0


class ClusterHealth(BaseModel):
    status: str = "unknown"
    message: str = ""
    health_percent: float = 0
    version: str = ""
    nodes: list[dict] = []
    components: dict = {}
    storage_classes: list[str] = []


class VersionInfo(BaseModel):
    major: str = ""
    minor: str = ""
    git_version: str = ""
    git_commit: str = ""
    git_tree_state: str = ""
    build_date: str = ""
    go_version: str = ""
    compiler: str = ""
    platform: str = ""
