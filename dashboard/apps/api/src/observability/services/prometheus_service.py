from ..utils import _get_prometheus_client, _make_request


def _get_prometheus_url():
    return _get_prometheus_client()


def query_metrics(query: str = "") -> list[dict]:
    url = _get_prometheus_url()
    if not url:
        return []
    if query:
        data = _make_request(url, f"/api/v1/query?query={query}")
        if data and isinstance(data, dict):
            results = data.get("data", {}).get("result", [])
            return [
                {
                    "name": r.get("metric", {}).get("__name__", ""),
                    "value": float(r.get("value", [0, 0])[1]) if r.get("value") else 0,
                    "labels": r.get("metric", {}),
                    "timestamp": float(r.get("value", [0, 0])[0]) if r.get("value") else 0,
                }
                for r in results
            ]
    else:
        data = _make_request(url, "/api/v1/label/__name__/values")
        if data and isinstance(data, dict):
            names = data.get("data", [])
            return [{"name": n, "value": 0, "labels": {}, "timestamp": 0} for n in names[:100]]
    return []


def list_targets() -> list[dict]:
    url = _get_prometheus_url()
    if not url:
        return []
    data = _make_request(url, "/api/v1/targets")
    if data and isinstance(data, dict):
        targets = data.get("data", {}).get("activeTargets", [])
        return [
            {
                "job": t.get("labels", {}).get("job", ""),
                "instance": t.get("labels", {}).get("instance", ""),
                "health": t.get("health", ""),
                "last_scrape": t.get("lastScrape", ""),
                "scrape_duration": t.get("lastScrapeDuration", 0),
                "error": t.get("lastError", ""),
            }
            for t in targets
        ]
    return []


def list_rules() -> list[dict]:
    url = _get_prometheus_url()
    if not url:
        return []
    data = _make_request(url, "/api/v1/rules")
    if data and isinstance(data, dict):
        groups = data.get("data", {}).get("groups", [])
        rules = []
        for g in groups:
            for r in g.get("rules", []):
                rules.append(
                    {
                        "name": r.get("name", ""),
                        "type": r.get("type", ""),
                        "query": r.get("query", ""),
                        "duration": r.get("duration", ""),
                        "severity": r.get("labels", {}).get("severity", ""),
                        "state": r.get("state", ""),
                        "health": r.get("health", ""),
                    }
                )
        return rules
    return []


def list_alerts() -> list[dict]:
    url = _get_prometheus_url()
    if not url:
        return []
    data = _make_request(url, "/api/v1/alerts")
    if data and isinstance(data, dict):
        alerts = data.get("data", {}).get("alerts", [])
        return [
            {
                "name": a.get("labels", {}).get("alertname", ""),
                "state": a.get("state", ""),
                "severity": a.get("labels", {}).get("severity", ""),
                "query": a.get("query", ""),
                "duration": a.get("duration", ""),
                "value": str(a.get("value", "")),
                "annotations": a.get("annotations", {}),
                "active_at": a.get("activeAt", ""),
            }
            for a in alerts
        ]
    return []
