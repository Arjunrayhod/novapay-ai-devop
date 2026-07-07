'use client';

import { useQuery } from '@tanstack/react-query';
import * as envApi from '../services/environment-api';

export function useSystemInfo(enabled?: boolean) {
  return useQuery({
    queryKey: ['environment', 'system'],
    queryFn: envApi.fetchSystemInfo,
    refetchInterval: 10_000,
    enabled,
  });
}

export function useTools(enabled?: boolean) {
  return useQuery({
    queryKey: ['environment', 'tools'],
    queryFn: envApi.fetchTools,
    refetchInterval: 10_000,
    enabled,
  });
}

export function useValidation(enabled?: boolean) {
  return useQuery({
    queryKey: ['environment', 'validation'],
    queryFn: envApi.fetchValidation,
    refetchInterval: 10_000,
    enabled,
  });
}

export function useHealth(enabled?: boolean) {
  return useQuery({
    queryKey: ['environment', 'health'],
    queryFn: envApi.fetchHealth,
    refetchInterval: 10_000,
    enabled,
  });
}

export function useReport(enabled?: boolean) {
  return useQuery({
    queryKey: ['environment', 'report'],
    queryFn: envApi.fetchReport,
    refetchInterval: 10_000,
    enabled,
  });
}

export function useFullEnvironmentScan(enabled?: boolean) {
  const systemQuery = useSystemInfo(enabled);
  const toolsQuery = useTools(enabled);
  const validationQuery = useValidation(enabled);
  const healthQuery = useHealth(enabled);

  const isLoading = systemQuery.isLoading || toolsQuery.isLoading || validationQuery.isLoading || healthQuery.isLoading;
  const isError = systemQuery.isError || toolsQuery.isError || validationQuery.isError || healthQuery.isError;
  const error = systemQuery.error || toolsQuery.error || validationQuery.error || healthQuery.error;

  return {
    system: systemQuery.data,
    tools: toolsQuery.data,
    validation: validationQuery.data,
    health: healthQuery.data,
    isLoading,
    isError,
    error,
    refetch: () => {
      systemQuery.refetch();
      toolsQuery.refetch();
      validationQuery.refetch();
      healthQuery.refetch();
    },
  };
}
