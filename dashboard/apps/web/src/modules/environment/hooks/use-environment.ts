'use client';

import { useQuery } from '@tanstack/react-query';
import * as envApi from '../services/environment-api';

export function useSystemInfo() {
  return useQuery({
    queryKey: ['environment', 'system'],
    queryFn: envApi.fetchSystemInfo,
    refetchOnWindowFocus: false,
  });
}

export function useTools() {
  return useQuery({
    queryKey: ['environment', 'tools'],
    queryFn: envApi.fetchTools,
    refetchOnWindowFocus: false,
  });
}

export function useValidation() {
  return useQuery({
    queryKey: ['environment', 'validation'],
    queryFn: envApi.fetchValidation,
    refetchOnWindowFocus: false,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['environment', 'health'],
    queryFn: envApi.fetchHealth,
    refetchOnWindowFocus: false,
  });
}

export function useReport() {
  return useQuery({
    queryKey: ['environment', 'report'],
    queryFn: envApi.fetchReport,
    refetchOnWindowFocus: false,
  });
}

export function useFullEnvironmentScan() {
  const systemQuery = useSystemInfo();
  const toolsQuery = useTools();
  const validationQuery = useValidation();
  const healthQuery = useHealth();

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
