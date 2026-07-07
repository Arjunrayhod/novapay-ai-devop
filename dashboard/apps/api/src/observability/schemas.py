from pydantic import BaseModel


class PrometheusMetric(BaseModel):
    name: str
    value: float
    labels: dict[str, str] = {}
    timestamp: float = 0


class PrometheusTarget(BaseModel):
    job: str
    instance: str
    health: str
    last_scrape: str = ""
    scrape_duration: float = 0
    error: str = ""


class PrometheusRule(BaseModel):
    name: str
    type: str = ""
    query: str = ""
    duration: str = ""
    severity: str = ""
    state: str = ""
    health: str = ""


class PrometheusAlert(BaseModel):
    name: str
    state: str
    severity: str = ""
    query: str = ""
    duration: str = ""
    value: str = ""
    annotations: dict[str, str] = {}
    active_at: str = ""


class GrafanaHealth(BaseModel):
    database: str = ""
    version: str = ""
    commit: str = ""


class GrafanaDashboard(BaseModel):
    uid: str
    title: str
    url: str = ""
    folder_title: str = ""
    tags: list[str] = []
    starred: bool = False


class GrafanaDatasource(BaseModel):
    uid: str
    name: str
    type: str
    url: str = ""
    access: str = ""
    database: str = ""
    is_default: bool = False


class LokiLogEntry(BaseModel):
    timestamp: str
    line: str
    labels: dict[str, str] = {}


class LokiLabel(BaseModel):
    name: str
    values: list[str] = []


class TempoTrace(BaseModel):
    trace_id: str
    start_time: str = ""
    duration_ms: float = 0
    service_name: str = ""
    span_count: int = 0
    status: str = ""


class TempoService(BaseModel):
    name: str
    span_count: int = 0
    error_count: int = 0
    p50_duration_ms: float = 0
    p99_duration_ms: float = 0


class OTelCollector(BaseModel):
    name: str
    version: str = ""
    endpoint: str = ""
    health: str = ""
    metrics_received: int = 0
    last_report: str = ""


class ObservabilityHealth(BaseModel):
    prometheus: str = "unavailable"
    grafana: str = "unavailable"
    loki: str = "unavailable"
    tempo: str = "unavailable"
    otel: str = "unavailable"


class ObservabilityOverview(BaseModel):
    prometheus_healthy: bool = False
    grafana_healthy: bool = False
    loki_healthy: bool = False
    tempo_healthy: bool = False
    otel_healthy: bool = False
    active_alerts: int = 0
    active_targets: int = 0
    active_services: int = 0
    dashboards_count: int = 0
    datasources_count: int = 0
