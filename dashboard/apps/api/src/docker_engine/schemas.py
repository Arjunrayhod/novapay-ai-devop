from typing import Any

from pydantic import BaseModel


class ContainerInfo(BaseModel):
    id: str
    name: str
    image: str
    status: str
    state: str
    ports: str
    created: str
    uptime: str
    restart_count: int
    health: str | None = None


class ImageInfo(BaseModel):
    id: str
    repository: str
    tag: str
    size: str
    created: str


class NetworkInfo(BaseModel):
    id: str
    name: str
    driver: str
    scope: str
    subnet: str | None = None
    attached_containers: int


class VolumeInfo(BaseModel):
    name: str
    driver: str
    mount_point: str
    size: str | None = None


class ContainerStats(BaseModel):
    container_id: str
    container_name: str
    cpu_percent: float
    memory_percent: float
    memory_usage: int
    memory_limit: int
    network_rx: int
    network_tx: int
    disk_read: int
    disk_write: int


class DockerInfo(BaseModel):
    running: bool
    containers_total: int
    containers_running: int
    containers_paused: int
    containers_stopped: int
    images: int
    volumes: int
    networks: int
    server_version: str | None = None
    api_version: str | None = None
    os: str | None = None
    kernel: str | None = None
    driver: str | None = None
    data_dir: str | None = None
    disk_usage: dict[str, Any] = {}
    memory: int | None = None
    cpus: int | None = None


class DockerVersion(BaseModel):
    version: str
    api_version: str
    min_api_version: str
    git_commit: str
    go_version: str
    os: str
    arch: str
    build_time: str | None = None


class DockerEvent(BaseModel):
    type: str
    action: str
    actor_id: str
    actor_name: str
    time: str
    scope: str | None = None
