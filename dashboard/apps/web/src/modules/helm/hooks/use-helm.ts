'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as helmApi from '../services/helm-api';

export function useHelmVersion() {
  return useQuery({
    queryKey: ['helm', 'version'],
    queryFn: helmApi.fetchHelmVersion,
    refetchInterval: 10_000,
  });
}

export function useHelmHealth() {
  return useQuery({
    queryKey: ['helm', 'health'],
    queryFn: helmApi.fetchHelmHealth,
    refetchInterval: 10_000,
  });
}

export function useHelmOverviewData() {
  return useQuery({
    queryKey: ['helm', 'overview'],
    queryFn: helmApi.fetchHelmOverview,
    refetchInterval: 10_000,
  });
}

export function useReleases(namespace?: string) {
  return useQuery({
    queryKey: ['helm', 'releases', namespace],
    queryFn: () => helmApi.fetchReleases(namespace),
    refetchInterval: 10_000,
  });
}

export function useRelease(name: string, namespace?: string) {
  return useQuery({
    queryKey: ['helm', 'release', name, namespace],
    queryFn: () => helmApi.fetchRelease(name, namespace),
    refetchInterval: 10_000,
  });
}

export function useReleaseHistory(name: string, namespace?: string) {
  return useQuery({
    queryKey: ['helm', 'history', name, namespace],
    queryFn: () => helmApi.fetchReleaseHistory(name, namespace),
    refetchInterval: 10_000,
  });
}

export function useCharts(repo?: string) {
  return useQuery({
    queryKey: ['helm', 'charts', repo],
    queryFn: () => helmApi.fetchCharts(repo),
    refetchInterval: 10_000,
  });
}

export function useRepositories() {
  return useQuery({
    queryKey: ['helm', 'repositories'],
    queryFn: helmApi.fetchRepositories,
    refetchInterval: 10_000,
  });
}

export function useReleaseValues(release: string, namespace?: string) {
  return useQuery({
    queryKey: ['helm', 'values', release, namespace],
    queryFn: () => helmApi.fetchReleaseValues(release, namespace),
    refetchInterval: 10_000,
  });
}

export function useChartDependencies(chartRef: string) {
  return useQuery({
    queryKey: ['helm', 'dependencies', chartRef],
    queryFn: () => helmApi.fetchChartDependencies(chartRef),
    refetchInterval: 10_000,
  });
}

export function useHelmOverview() {
  const overview = useHelmOverviewData();
  const health = useHelmHealth();
  const version = useHelmVersion();
  const releases = useReleases();
  const repos = useRepositories();
  const charts = useCharts();

  const isLoading = overview.isLoading || health.isLoading;
  const isError = overview.isError;

  const refetch = useCallback(() => {
    overview.refetch();
    health.refetch();
    version.refetch();
    releases.refetch();
    repos.refetch();
    charts.refetch();
  }, [overview, health, version, releases, repos, charts]);

  return {
    overview: overview.data,
    health: health.data,
    version: version.data,
    releases: releases.data,
    repositories: repos.data,
    charts: charts.data,
    isLoading,
    isError,
    refetch,
  };
}
