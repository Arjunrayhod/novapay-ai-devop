export interface PrometheusMetric {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export interface PrometheusTarget {
  job: string;
  instance: string;
  health: string;
  last_scrape: string;
  scrape_duration: number;
  error: string;
}

export interface PrometheusRule {
  name: string;
  type: string;
  query: string;
  duration: string;
  severity: string;
  state: string;
  health: string;
}

export interface PrometheusAlert {
  name: string;
  state: string;
  severity: string;
  query: string;
  duration: string;
  value: string;
  annotations: Record<string, string>;
  active_at: string;
}

export interface GrafanaHealth {
  database: string;
  version: string;
  commit: string;
}

export interface GrafanaDashboard {
  uid: string;
  title: string;
  url: string;
  folder_title: string;
  tags: string[];
  starred: boolean;
}

export interface GrafanaDatasource {
  uid: string;
  name: string;
  type: string;
  url: string;
  access: string;
  database: string;
  is_default: boolean;
}

export interface LokiLogEntry {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
}

export interface LokiLabel {
  name: string;
  values: string[];
}

export interface TempoTrace {
  trace_id: string;
  start_time: string;
  duration_ms: number;
  service_name: string;
  span_count: number;
  status: string;
}

export interface TempoService {
  name: string;
  span_count: number;
  error_count: number;
  p50_duration_ms: number;
  p99_duration_ms: number;
}

export interface OTelCollector {
  name: string;
  version: string;
  endpoint: string;
  health: string;
  metrics_received: number;
  last_report: string;
}

export interface ObservabilityHealth {
  prometheus: string;
  grafana: string;
  loki: string;
  tempo: string;
  otel: string;
}

export interface ObservabilityOverview {
  prometheus_healthy: boolean;
  grafana_healthy: boolean;
  loki_healthy: boolean;
  tempo_healthy: boolean;
  otel_healthy: boolean;
  active_alerts: number;
  active_targets: number;
  active_services: number;
  dashboards_count: number;
  datasources_count: number;
}
