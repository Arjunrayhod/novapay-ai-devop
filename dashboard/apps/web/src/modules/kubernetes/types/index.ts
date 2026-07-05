export interface NodeInfo {
  name: string;
  roles: string[];
  status: string;
  cpu_capacity: number;
  cpu_allocatable: number;
  memory_capacity: number;
  memory_allocatable: number;
  pods_capacity: number;
  pods_allocated: number;
  age: string;
  kernel_version: string;
  os_image: string;
  container_runtime: string;
  kubelet_version: string;
  kube_proxy_version: string;
  architecture: string;
  operating_system: string;
  internal_ip: string;
  external_ip: string;
  labels: Record<string, string>;
  taints: { key: string; value: string; effect: string }[];
}

export interface NamespaceInfo {
  name: string;
  status: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  created: string;
  age: string;
}

export interface ContainerInfo {
  name: string;
  image: string;
  ready: boolean;
  restart_count: number;
  state: string;
  state_reason: string | null;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  reason: string;
  restart_count: number;
  ready_containers: number;
  total_containers: number;
  node_name: string;
  host_ip: string;
  pod_ip: string;
  qos_class: string;
  labels: Record<string, string>;
  created: string;
  age: string;
  containers: ContainerInfo[];
}

export interface DeploymentInfo {
  name: string;
  namespace: string;
  replicas: number;
  ready_replicas: number;
  available_replicas: number;
  unavailable_replicas: number;
  updated_replicas: number;
  strategy: string;
  available: boolean;
  progressing: boolean;
  labels: Record<string, string>;
  selector: Record<string, string>;
  created: string;
  age: string;
  containers: { name: string; image: string; image_pull_policy: string }[];
}

export interface DaemonSetInfo {
  name: string;
  namespace: string;
  desired_scheduled: number;
  current_scheduled: number;
  ready: number;
  available: number;
  updated: number;
  strategy: string;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface StatefulSetInfo {
  name: string;
  namespace: string;
  replicas: number;
  ready_replicas: number;
  current_replicas: number;
  updated_replicas: number;
  service_name: string;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  cluster_ip: string;
  cluster_ips: string[];
  external_ip: string[];
  external_traffic_policy: string;
  ports: string[];
  selector: Record<string, string>;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface IngressInfo {
  name: string;
  namespace: string;
  class_name: string;
  rules: {
    host: string;
    paths: { path: string; path_type: string; service_name: string; service_port: string }[];
  }[];
  tls: { hosts: string[]; secret_name: string }[];
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface ConfigMapInfo {
  name: string;
  namespace: string;
  data_count: number;
  binary_data_count: number;
  total_keys: number;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface SecretInfo {
  name: string;
  namespace: string;
  type: string;
  data_keys: string[];
  data_count: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  created: string;
  age: string;
  notice: string;
}

export interface PersistentVolumeInfo {
  name: string;
  capacity: string;
  storage_class: string;
  access_modes: string[];
  reclaim_policy: string;
  status: string;
  claim: string;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface PersistentVolumeClaimInfo {
  name: string;
  namespace: string;
  status: string;
  storage_class: string;
  access_modes: string[];
  capacity: string;
  volume_name: string;
  labels: Record<string, string>;
  created: string;
  age: string;
}

export interface EventInfo {
  name: string;
  namespace: string;
  type: string;
  reason: string;
  message: string;
  source: { component: string; host: string };
  involved_object: { kind: string; name: string; namespace: string; api_version: string };
  count: number;
  first_seen: string;
  last_seen: string;
  age: string;
  created: string;
}

export interface PodMetric {
  name: string;
  namespace: string;
  cpu_millicores: number;
  memory_bytes: number;
  containers: { name: string; cpu_millicores: number; memory_bytes: number }[];
}

export interface NodeMetric {
  name: string;
  cpu_millicores: number;
  memory_bytes: number;
}

export interface ClusterMetrics {
  pod_count: number;
  total_pod_cpu_millicores: number;
  total_pod_memory_bytes: number;
  total_node_cpu_millicores: number;
  total_node_memory_bytes: number;
  total_capacity_cpu_millicores: number;
  total_capacity_memory_bytes: number;
  cpu_utilization_percent: number;
  memory_utilization_percent: number;
  metrics_available: boolean;
}

export interface ClusterInfo {
  version: Record<string, string>;
  nodes_total: number;
  nodes_ready: number;
  namespaces: number;
  pods_total: number;
  pods_running: number;
  services: number;
  total_cpu_cores: number;
  total_memory_bytes: number;
}

export interface ClusterHealth {
  status: string;
  message: string;
  health_percent: number;
  version: string;
  nodes: {
    name: string;
    ready: boolean;
    conditions: Record<string, string>;
    last_heartbeat: string | null;
  }[];
  components: Record<string, boolean>;
  storage_classes: string[];
}

export interface VersionInfo {
  major: string;
  minor: string;
  git_version: string;
  git_commit: string;
  git_tree_state: string;
  build_date: string;
  go_version: string;
  compiler: string;
  platform: string;
}
