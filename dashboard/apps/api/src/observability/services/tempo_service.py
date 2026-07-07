from ..utils import _get_tempo_client, _make_request


def _get_tempo_url():
    return _get_tempo_client()


def search_traces(service: str = "", limit: int = 20) -> list[dict]:
    url = _get_tempo_url()
    if not url:
        return []
    params = f"?limit={limit}"
    if service:
        params += f"&service={service}"
    data = _make_request(url, f"/api/search{params}")
    if data and isinstance(data, dict):
        traces = data.get("traces", [])
        return [
            {
                "trace_id": t.get("traceID", ""),
                "start_time": t.get("startTime", ""),
                "duration_ms": t.get("durationMs", 0),
                "service_name": t.get("serviceName", ""),
                "span_count": t.get("spanCount", 0),
                "status": "ok" if t.get("status", 0) == 0 else "error",
            }
            for t in traces
        ]
    return []


def list_services() -> list[dict]:
    url = _get_tempo_url()
    if not url:
        return []
    data = _make_request(url, "/api/services")
    if data and isinstance(data, dict):
        services = data.get("services", [])
        return [
            {
                "name": s.get("name", ""),
                "span_count": s.get("spanCount", 0),
                "error_count": s.get("errorCount", 0),
                "p50_duration_ms": s.get("p50DurationMs", 0),
                "p99_duration_ms": s.get("p99DurationMs", 0),
            }
            for s in services
        ]
    return []
