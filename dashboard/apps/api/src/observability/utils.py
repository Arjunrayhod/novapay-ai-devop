import httpx

from ..settings import settings

_client: httpx.Client | None = None


def _get_client() -> httpx.Client:
    global _client
    if _client is None:
        _client = httpx.Client(timeout=10.0)
    return _client


def _make_request(url: str, path: str) -> dict | list | None:
    try:
        client = _get_client()
        response = client.get(f"{url}{path}")
        response.raise_for_status()
        if response.status_code == 204:
            return None
        return response.json()
    except Exception:
        return None


def _get_prometheus_client():
    return settings.PROMETHEUS_URL


def _get_grafana_client():
    return settings.GRAFANA_URL


def _get_loki_client():
    return settings.LOKI_URL


def _get_tempo_client():
    return settings.TEMPO_URL
