from fastapi import APIRouter

from .schemas import (
    GrafanaDashboard,
    GrafanaDatasource,
    GrafanaHealth,
    LokiLabel,
    LokiLogEntry,
    ObservabilityHealth,
    ObservabilityOverview,
    OTelCollector,
    PrometheusAlert,
    PrometheusMetric,
    PrometheusRule,
    PrometheusTarget,
    TempoService,
    TempoTrace,
)
from .services.grafana_service import check_health, list_dashboards, list_datasources
from .services.health_service import get_observability_health, get_observability_overview
from .services.loki_service import list_labels, query_logs
from .services.otel_service import list_collectors
from .services.prometheus_service import list_alerts, list_rules, list_targets, query_metrics
from .services.tempo_service import list_services, search_traces

router = APIRouter()


@router.get("/health")
async def observability_health() -> ObservabilityHealth:
    return ObservabilityHealth(**get_observability_health())


@router.get("/overview")
async def observability_overview() -> ObservabilityOverview:
    return ObservabilityOverview(**get_observability_overview())


@router.get("/prometheus/metrics")
async def prometheus_metrics(query: str = "") -> list[PrometheusMetric]:
    return [PrometheusMetric(**m) for m in query_metrics(query)]


@router.get("/prometheus/targets")
async def prometheus_targets() -> list[PrometheusTarget]:
    return [PrometheusTarget(**t) for t in list_targets()]


@router.get("/prometheus/rules")
async def prometheus_rules() -> list[PrometheusRule]:
    return [PrometheusRule(**r) for r in list_rules()]


@router.get("/prometheus/alerts")
async def prometheus_alerts() -> list[PrometheusAlert]:
    return [PrometheusAlert(**a) for a in list_alerts()]


@router.get("/grafana/health")
async def grafana_health() -> GrafanaHealth:
    return GrafanaHealth(**check_health())


@router.get("/grafana/dashboards")
async def grafana_dashboards() -> list[GrafanaDashboard]:
    return [GrafanaDashboard(**d) for d in list_dashboards()]


@router.get("/grafana/datasources")
async def grafana_datasources() -> list[GrafanaDatasource]:
    return [GrafanaDatasource(**d) for d in list_datasources()]


@router.get("/loki/logs")
async def loki_logs(query: str = '{job=~".+"}', limit: int = 50) -> list[LokiLogEntry]:
    return [LokiLogEntry(**e) for e in query_logs(query, limit)]


@router.get("/loki/labels")
async def loki_labels() -> list[LokiLabel]:
    return [LokiLabel(**lb) for lb in list_labels()]


@router.get("/tempo/traces")
async def tempo_traces(service: str = "", limit: int = 20) -> list[TempoTrace]:
    return [TempoTrace(**t) for t in search_traces(service, limit)]


@router.get("/tempo/services")
async def tempo_services() -> list[TempoService]:
    return [TempoService(**s) for s in list_services()]


@router.get("/otel/collectors")
async def otel_collectors() -> list[OTelCollector]:
    return [OTelCollector(**c) for c in list_collectors()]
