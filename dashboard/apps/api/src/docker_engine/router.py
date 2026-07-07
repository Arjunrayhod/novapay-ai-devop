import json
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from .schemas import (
    ContainerInfo,
    ContainerStats,
    DockerEvent,
    DockerInfo,
    DockerVersion,
    ImageInfo,
    NetworkInfo,
    VolumeInfo,
)
from .services.container_service import get_container, list_containers
from .services.docker_service import get_client, is_docker_running
from .services.health_service import get_docker_info
from .services.image_service import list_images
from .services.network_service import list_networks
from .services.stats_service import get_all_stats
from .services.volume_service import list_volumes

router = APIRouter()


def _require_docker():
    if not is_docker_running():
        raise HTTPException(status_code=503, detail="Docker daemon is not running")


@router.get("/info")
async def docker_info() -> DockerInfo:
    return get_docker_info()


@router.get("/version")
async def docker_version() -> DockerVersion:
    _require_docker()
    client = get_client()
    v = client.version() if client else {}
    return DockerVersion(
        version=v.get("Version", "unknown"),
        api_version=v.get("ApiVersion", "unknown"),
        min_api_version=v.get("MinAPIVersion", "unknown"),
        git_commit=v.get("GitCommit", "unknown"),
        go_version=v.get("GoVersion", "unknown"),
        os=v.get("Os", "unknown"),
        arch=v.get("Arch", "unknown"),
        build_time=v.get("BuildTime"),
    )


@router.get("/containers")
async def docker_containers() -> list[ContainerInfo]:
    _require_docker()
    return list_containers(all=True)


@router.get("/container/{container_id}")
async def docker_container(container_id: str) -> ContainerInfo:
    _require_docker()
    c = get_container(container_id)
    if not c:
        raise HTTPException(status_code=404, detail="Container not found")
    return c


@router.get("/images")
async def docker_images() -> list[ImageInfo]:
    _require_docker()
    return list_images()


@router.get("/networks")
async def docker_networks() -> list[NetworkInfo]:
    _require_docker()
    return list_networks()


@router.get("/volumes")
async def docker_volumes() -> list[VolumeInfo]:
    _require_docker()
    return list_volumes()


@router.get("/stats")
async def docker_stats() -> list[ContainerStats]:
    _require_docker()
    return get_all_stats()


@router.get("/events")
async def docker_events():
    _require_docker()
    client = get_client()

    async def event_generator():
        try:
            for event in client.events(decode=True):
                event_type = event.get("Type", "unknown")
                action = event.get("Action", "unknown")
                actor = event.get("Actor", {})
                actor_id = actor.get("ID", "")[:12]
                actor_name = (
                    actor.get("Attributes", {}).get("name", actor_id)
                    if actor.get("Attributes")
                    else actor_id
                )
                ts = event.get("time", 0)
                time_str = datetime.fromtimestamp(ts, tz=UTC).isoformat() if ts else ""
                data = DockerEvent(
                    type=event_type,
                    action=action,
                    actor_id=actor_id,
                    actor_name=actor_name,
                    time=time_str,
                    scope=event.get("scope"),
                )
                yield f"data: {data.model_dump_json()}\n\n"
        except Exception:
            yield f"data: {json.dumps({'type': 'error', 'action': 'stream_ended'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/system")
async def docker_system() -> dict:
    _require_docker()
    info = get_docker_info()
    client = get_client()
    v = client.version() if client else {}
    return {
        "info": info.model_dump(),
        "version": v,
    }
