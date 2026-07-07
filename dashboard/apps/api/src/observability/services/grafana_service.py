from ..utils import _get_grafana_client, _make_request


def _get_grafana_url():
    return _get_grafana_client()


def check_health() -> dict:
    url = _get_grafana_url()
    if not url:
        return {"database": "", "version": "", "commit": ""}
    data = _make_request(url, "/api/health")
    if data and isinstance(data, dict):
        return {
            "database": data.get("database", ""),
            "version": data.get("version", ""),
            "commit": data.get("commit", ""),
        }
    return {"database": "", "version": "", "commit": ""}


def list_dashboards() -> list[dict]:
    url = _get_grafana_url()
    if not url:
        return []
    data = _make_request(url, "/api/search")
    if data and isinstance(data, list):
        return [
            {
                "uid": d.get("uid", ""),
                "title": d.get("title", ""),
                "url": d.get("url", ""),
                "folder_title": d.get("folderTitle", ""),
                "tags": d.get("tags", []),
                "starred": d.get("isStarred", False),
            }
            for d in data
        ]
    return []


def list_datasources() -> list[dict]:
    url = _get_grafana_url()
    if not url:
        return []
    data = _make_request(url, "/api/datasources")
    if data and isinstance(data, list):
        return [
            {
                "uid": d.get("uid", ""),
                "name": d.get("name", ""),
                "type": d.get("type", ""),
                "url": d.get("url", ""),
                "access": d.get("access", ""),
                "database": d.get("database", ""),
                "is_default": d.get("isDefault", False),
            }
            for d in data
        ]
    return []
