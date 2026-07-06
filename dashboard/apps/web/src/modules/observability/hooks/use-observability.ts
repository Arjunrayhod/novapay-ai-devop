'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as observabilityApi from '../services/observability-api';

export function useObservabilityHealth() {
  return useQuery({
    queryKey: ['observability', 'health'],
    queryFn: observabilityApi.fetchObservabilityHealth,
    refetchInterval: 10_000,
  });
}

export function useObservabilityOverview() {
  return useQuery({
    queryKey: ['observability', 'overview'],
    queryFn: observabilityApi.fetchObservabilityOverview,
    refetchInterval: 10_000,
  });
}

export function usePrometheusMetrics(query = '') {
  return useQuery({
    queryKey: ['observability', 'prometheus', 'metrics', query],
    queryFn: () => observabilityApi.fetchPrometheusMetrics(query),
    refetchInterval: 10_000,
  });
}

export function usePrometheusTargets() {
  return useQuery({
    queryKey: ['observability', 'prometheus', 'targets'],
    queryFn: observabilityApi.fetchPrometheusTargets,
    refetchInterval: 10_000,
  });
}

export function usePrometheusRules() {
  return useQuery({
    queryKey: ['observability', 'prometheus', 'rules'],
    queryFn: observabilityApi.fetchPrometheusRules,
    refetchInterval: 10_000,
  });
}

export function usePrometheusAlerts() {
  return useQuery({
    queryKey: ['observability', 'prometheus', 'alerts'],
    queryFn: observabilityApi.fetchPrometheusAlerts,
    refetchInterval: 10_000,
  });
}

export function useGrafanaHealth() {
  return useQuery({
    queryKey: ['observability', 'grafana', 'health'],
    queryFn: observabilityApi.fetchGrafanaHealth,
    refetchInterval: 10_000,
  });
}

export function useGrafanaDashboards() {
  return useQuery({
    queryKey: ['observability', 'grafana', 'dashboards'],
    queryFn: observabilityApi.fetchGrafanaDashboards,
    refetchInterval: 10_000,
  });
}

export function useGrafanaDatasources() {
  return useQuery({
    queryKey: ['observability', 'grafana', 'datasources'],
    queryFn: observabilityApi.fetchGrafanaDatasources,
    refetchInterval: 10_000,
  });
}

export function useLokiLogs(query = '{job=~".+"}', limit = 50) {
  return useQuery({
    queryKey: ['observability', 'loki', 'logs', query, limit],
    queryFn: () => observabilityApi.fetchLokiLogs(query, limit),
    refetchInterval: 10_000,
  });
}

export function useLokiLabels() {
  return useQuery({
    queryKey: ['observability', 'loki', 'labels'],
    queryFn: observabilityApi.fetchLokiLabels,
    refetchInterval: 10_000,
  });
}

export function useTempoTraces(service = '', limit = 20) {
  return useQuery({
    queryKey: ['observability', 'tempo', 'traces', service, limit],
    queryFn: () => observabilityApi.fetchTempoTraces(service, limit),
    refetchInterval: 10_000,
  });
}

export function useTempoServices() {
  return useQuery({
    queryKey: ['observability', 'tempo', 'services'],
    queryFn: observabilityApi.fetchTempoServices,
    refetchInterval: 10_000,
  });
}

export function useOTelCollectors() {
  return useQuery({
    queryKey: ['observability', 'otel', 'collectors'],
    queryFn: observabilityApi.fetchOTelCollectors,
    refetchInterval: 10_000,
  });
}

export function useObservability() {
  const health = useObservabilityHealth();
  const overview = useObservabilityOverview();
  const targets = usePrometheusTargets();
  const alerts = usePrometheusAlerts();
  const services = useTempoServices();
  const dashboards = useGrafanaDashboards();
  const datasources = useGrafanaDatasources();
  const collectors = useOTelCollectors();
  const rules = usePrometheusRules();

  const isLoading = health.isLoading || overview.isLoading;
  const isError = health.isError;

  const refetch = useCallback(() => {
    health.refetch();
    overview.refetch();
    targets.refetch();
    alerts.refetch();
    services.refetch();
    dashboards.refetch();
    datasources.refetch();
    collectors.refetch();
    rules.refetch();
  }, [health, overview, targets, alerts, services, dashboards, datasources, collectors, rules]);

  return {
    health: health.data,
    overview: overview.data,
    targets: targets.data,
    alerts: alerts.data,
    services: services.data,
    dashboards: dashboards.data,
    datasources: datasources.data,
    collectors: collectors.data,
    rules: rules.data,
    isLoading,
    isError,
    refetch,
  };
}
