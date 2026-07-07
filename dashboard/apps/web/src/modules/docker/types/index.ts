export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
  uptime: string;
  restart_count: number;
  health: string | null;
}

export interface ImageInfo {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface NetworkInfo {
  id: string;
  name: string;
  driver: string;
  scope: string;
  subnet: string | null;
  attached_containers: number;
}

export interface VolumeInfo {
  name: string;
  driver: string;
  mount_point: string;
  size: string | null;
}

export interface ContainerStats {
  container_id: string;
  container_name: string;
  cpu_percent: number;
  memory_percent: number;
  memory_usage: number;
  memory_limit: number;
  network_rx: number;
  network_tx: number;
  disk_read: number;
  disk_write: number;
}

export interface DiskUsage {
  layers_size: number;
  containers_size: number;
  images_size: number;
  volumes_size: number;
}

export interface DockerInfo {
  running: boolean;
  containers_total: number;
  containers_running: number;
  containers_paused: number;
  containers_stopped: number;
  images: number;
  volumes: number;
  networks: number;
  server_version: string | null;
  api_version: string | null;
  os: string | null;
  kernel: string | null;
  driver: string | null;
  data_dir: string | null;
  disk_usage: DiskUsage;
  memory: number | null;
  cpus: number | null;
}

export interface DockerVersion {
  version: string;
  api_version: string;
  min_api_version: string;
  git_commit: string;
  go_version: string;
  os: string;
  arch: string;
  build_time: string | null;
}

export interface DockerEvent {
  type: string;
  action: string;
  actor_id: string;
  actor_name: string;
  time: string;
  scope: string | null;
}
