'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as securityApi from '../services/security-api';

export function useSecurityHealth() {
  return useQuery({
    queryKey: ['security', 'health'],
    queryFn: securityApi.fetchSecurityHealth,
    refetchInterval: 15_000,
  });
}

export function useSecurityOverview() {
  return useQuery({
    queryKey: ['security', 'overview'],
    queryFn: securityApi.fetchSecurityOverview,
    refetchInterval: 15_000,
  });
}

export function useSastScan(target = '') {
  return useQuery({
    queryKey: ['security', 'sast', 'scan', target],
    queryFn: () => securityApi.fetchSastScan(target),
    refetchInterval: 60_000,
  });
}

export function useDependencyAudit() {
  return useQuery({
    queryKey: ['security', 'dependencies'],
    queryFn: securityApi.fetchDependencyAudit,
    refetchInterval: 60_000,
  });
}

export function useVulnerabilitySummary() {
  return useQuery({
    queryKey: ['security', 'vulnerabilities'],
    queryFn: securityApi.fetchVulnerabilitySummary,
    refetchInterval: 60_000,
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: ['security', 'policies'],
    queryFn: securityApi.fetchPolicies,
    refetchInterval: 30_000,
  });
}

export function usePolicyEvaluation() {
  return useQuery({
    queryKey: ['security', 'policies', 'evaluate'],
    queryFn: securityApi.fetchPolicyEvaluation,
    refetchInterval: 30_000,
  });
}

export function useComplianceReport() {
  return useQuery({
    queryKey: ['security', 'compliance'],
    queryFn: securityApi.fetchComplianceReport,
    refetchInterval: 30_000,
  });
}

export function useSecurity() {
  const health = useSecurityHealth();
  const overview = useSecurityOverview();
  const sast = useSastScan();
  const dependencies = useDependencyAudit();
  const vulnerabilities = useVulnerabilitySummary();
  const policies = usePolicies();
  const evaluations = usePolicyEvaluation();
  const compliance = useComplianceReport();

  const isLoading = health.isLoading || overview.isLoading;
  const isError = health.isError;

  const refetch = useCallback(() => {
    health.refetch();
    overview.refetch();
    sast.refetch();
    dependencies.refetch();
    vulnerabilities.refetch();
    policies.refetch();
    evaluations.refetch();
    compliance.refetch();
  }, [health, overview, sast, dependencies, vulnerabilities, policies, evaluations, compliance]);

  return {
    health: health.data,
    overview: overview.data,
    sast: sast.data,
    dependencies: dependencies.data,
    vulnerabilities: vulnerabilities.data,
    policies: policies.data,
    evaluations: evaluations.data,
    compliance: compliance.data,
    isLoading,
    isError,
    refetch,
  };
}
