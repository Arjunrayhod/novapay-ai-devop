from ..schemas import VolumeInfo
from ..services.docker_service import get_client


def list_volumes() -> list[VolumeInfo]:
    client = get_client()
    if not client:
        return []
    volumes = client.volumes.list()
    result = []
    for v in volumes:
        attrs = v.attrs
        result.append(
            VolumeInfo(
                name=v.name,
                driver=attrs.get("Driver", "local"),
                mount_point=attrs.get("Mountpoint", "—"),
                size=None,
            )
        )
    return result
