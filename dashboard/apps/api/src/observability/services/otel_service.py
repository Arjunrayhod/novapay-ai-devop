from ..utils import _make_request

_OTEL_COLLECTOR_URL = "http://localhost:4318"


def list_collectors() -> list[dict]:
    try:
        data = _make_request(_OTEL_COLLECTOR_URL, "/v1/metrics")
        if data:
            return [
                {
                    "name": "otel-collector",
                    "version": "",
                    "endpoint": _OTEL_COLLECTOR_URL,
                    "health": "healthy" if data else "unhealthy",
                    "metrics_received": 0,
                    "last_report": "",
                }
            ]
    except Exception:
        pass
    return []
