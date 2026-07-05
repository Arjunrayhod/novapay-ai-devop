from ..schemas import ImageInfo
from ..services.docker_service import get_client


def list_images() -> list[ImageInfo]:
    client = get_client()
    if not client:
        return []
    images = client.images.list(all=True)
    result = []
    for img in images:
        tags = img.tags
        if tags:
            repo, tag = tags[0].rsplit(":", 1)
        else:
            repo, tag = "<none>", "<none>"
        created = _format_created(img.attrs.get("Created", ""))
        result.append(
            ImageInfo(
                id=img.id.replace("sha256:", "")[:12],
                repository=repo,
                tag=tag,
                size=_format_size(img.attrs.get("Size", 0)),
                created=created,
            )
        )
    return result


def _format_size(size_bytes: int) -> str:
    if size_bytes == 0:
        return "0 B"
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} TB"


def _format_created(iso_str: str) -> str:
    if not iso_str:
        return "—"
    import datetime

    try:
        dt = datetime.datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return iso_str[:19]
