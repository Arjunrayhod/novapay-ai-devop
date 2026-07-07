from .grafana_service import check_health as grafana_health
from .grafana_service import list_dashboards, list_datasources
from .loki_service import query_logs
from .otel_service import list_collectors
from .prometheus_service import list_alerts, list_targets
from .tempo_service import list_services


def get_observability_health() -> dict:
    prom_ok = bool(list_alerts()) if list_alerts() is not None else False
    gra_ok = bool(grafana_health().get("version"))
    lok_ok = bool(query_logs(limit=1))
    tem_ok = bool(list_services())
    col = list_collectors()
    otl_ok = len(col) > 0 and col[0].get("health") == "healthy" if col else False

    return {
        "prometheus": "healthy" if prom_ok else "unavailable",
        "grafana": "healthy" if gra_ok else "unavailable",
        "loki": "healthy" if lok_ok else "unavailable",
        "tempo": "healthy" if tem_ok else "unavailable",
        "otel": "healthy" if otl_ok else "unavailable",
    }


def get_observability_overview() -> dict:
    alerts = list_alerts() or []
    targets = list_targets() or []
    services = list_services() or []
    dashboards = list_dashboards() or []
    datasources = list_datasources() or []

    return {
        "prometheus_healthy": len(alerts) >= 0 if alerts is not None else False,
        "grafana_healthy": bool(grafana_health().get("version")),
        "loki_healthy": bool(query_logs(limit=1)),
        "tempo_healthy": bool(services),
        "otel_healthy": False,
        "active_alerts": len(alerts),
        "active_targets": len(targets),
        "active_services": len(services),
        "dashboards_count": len(dashboards),
        "datasources_count": len(datasources),
    }
