import { api } from '@aegisai/utils';
import type {
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
} from '../types';

const BASE = '/api/observability';

export async function fetchObservabilityHealth(): Promise<ObservabilityHealth> {
  return api.get<ObservabilityHealth>(`${BASE}/health`);
}

export async function fetchObservabilityOverview(): Promise<ObservabilityOverview> {
  return api.get<ObservabilityOverview>(`${BASE}/overview`);
}

export async function fetchPrometheusMetrics(query = ''): Promise<PrometheusMetric[]> {
  const q = query ? `?query=${encodeURIComponent(query)}` : '';
  return api.get<PrometheusMetric[]>(`${BASE}/prometheus/metrics${q}`);
}

export async function fetchPrometheusTargets(): Promise<PrometheusTarget[]> {
  return api.get<PrometheusTarget[]>(`${BASE}/prometheus/targets`);
}

export async function fetchPrometheusRules(): Promise<PrometheusRule[]> {
  return api.get<PrometheusRule[]>(`${BASE}/prometheus/rules`);
}

export async function fetchPrometheusAlerts(): Promise<PrometheusAlert[]> {
  return api.get<PrometheusAlert[]>(`${BASE}/prometheus/alerts`);
}

export async function fetchGrafanaHealth(): Promise<GrafanaHealth> {
  return api.get<GrafanaHealth>(`${BASE}/grafana/health`);
}

export async function fetchGrafanaDashboards(): Promise<GrafanaDashboard[]> {
  return api.get<GrafanaDashboard[]>(`${BASE}/grafana/dashboards`);
}

export async function fetchGrafanaDatasources(): Promise<GrafanaDatasource[]> {
  return api.get<GrafanaDatasource[]>(`${BASE}/grafana/datasources`);
}

export async function fetchLokiLogs(query = '{job=~".+"}', limit = 50): Promise<LokiLogEntry[]> {
  return api.get<LokiLogEntry[]>(`${BASE}/loki/logs?query=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function fetchLokiLabels(): Promise<LokiLabel[]> {
  return api.get<LokiLabel[]>(`${BASE}/loki/labels`);
}

export async function fetchTempoTraces(service = '', limit = 20): Promise<TempoTrace[]> {
  const params = new URLSearchParams();
  if (service) params.set('service', service);
  params.set('limit', String(limit));
  return api.get<TempoTrace[]>(`${BASE}/tempo/traces?${params}`);
}

export async function fetchTempoServices(): Promise<TempoService[]> {
  return api.get<TempoService[]>(`${BASE}/tempo/services`);
}

export async function fetchOTelCollectors(): Promise<OTelCollector[]> {
  return api.get<OTelCollector[]>(`${BASE}/otel/collectors`);
}
