from ..utils import _get_loki_client, _make_request


def _get_loki_url():
    return _get_loki_client()


def query_logs(query: str = '{job=~".+"}', limit: int = 50) -> list[dict]:
    url = _get_loki_url()
    if not url:
        return []
    params = f"?query={query}&limit={limit}"
    data = _make_request(url, f"/loki/api/v1/query_range{params}")
    if data and isinstance(data, dict):
        result = data.get("data", {}).get("result", [])
        entries = []
        for stream in result:
            labels = stream.get("stream", {})
            for val in stream.get("values", []):
                if isinstance(val, list) and len(val) >= 2:
                    entries.append(
                        {
                            "timestamp": val[0],
                            "line": val[1],
                            "labels": labels,
                        }
                    )
        return entries
    return []


def list_labels() -> list[dict]:
    url = _get_loki_url()
    if not url:
        return []
    data = _make_request(url, "/loki/api/v1/labels")
    if data and isinstance(data, dict):
        label_names = data.get("data", [])
        result = []
        for name in label_names:
            values_data = _make_request(url, f"/loki/api/v1/label/{name}/values")
            values = values_data.get("data", []) if isinstance(values_data, dict) else []
            result.append(
                {
                    "name": name,
                    "values": values,
                }
            )
        return result
    return []
