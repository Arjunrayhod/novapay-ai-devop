'use client';

import { useQuery } from '@tanstack/react-query';
import * as devExpApi from '../services/dev-experience-api';

export function useScan() {
  return useQuery({
    queryKey: ['dev-experience', 'scan'],
    queryFn: devExpApi.fetchScan,
    refetchInterval: 10_000,
  });
}

export function usePathValidation() {
  return useQuery({
    queryKey: ['dev-experience', 'path'],
    queryFn: devExpApi.fetchPathValidation,
    refetchInterval: 10_000,
  });
}

export function useInstallCommands() {
  return useQuery({
    queryKey: ['dev-experience', 'install-commands'],
    queryFn: devExpApi.fetchInstallCommands,
    refetchInterval: 10_000,
  });
}

export function useAISuggestions() {
  return useQuery({
    queryKey: ['dev-experience', 'ai-suggestions'],
    queryFn: devExpApi.fetchAISuggestions,
    refetchInterval: 10_000,
  });
}

export function useReport() {
  return useQuery({
    queryKey: ['dev-experience', 'report'],
    queryFn: devExpApi.fetchReport,
    refetchInterval: 10_000,
  });
}

export function useDevExperience() {
  const scanQuery = useScan();
  const pathQuery = usePathValidation();
  const installQuery = useInstallCommands();
  const suggestionsQuery = useAISuggestions();
  const reportQuery = useReport();

  const isLoading =
    scanQuery.isLoading ||
    pathQuery.isLoading ||
    installQuery.isLoading ||
    suggestionsQuery.isLoading;

  const refetch = () => {
    scanQuery.refetch();
    pathQuery.refetch();
    installQuery.refetch();
    suggestionsQuery.refetch();
    reportQuery.refetch();
  };

  return {
    scan: scanQuery.data,
    pathValidation: pathQuery.data,
    installCommands: installQuery.data,
    suggestions: suggestionsQuery.data,
    report: reportQuery.data,
    isLoading,
    isError: scanQuery.isError,
    error: scanQuery.error,
    refetch,
  };
}
