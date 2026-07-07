'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as terraformApi from '../services/terraform-api';

export function useTerraformVersion() {
  return useQuery({
    queryKey: ['terraform', 'version'],
    queryFn: terraformApi.fetchTerraformVersion,
    refetchInterval: 10_000,
  });
}

export function useTerraformState() {
  return useQuery({
    queryKey: ['terraform', 'state'],
    queryFn: terraformApi.fetchTerraformState,
    refetchInterval: 10_000,
  });
}

export function useTerraformModules() {
  return useQuery({
    queryKey: ['terraform', 'modules'],
    queryFn: terraformApi.fetchTerraformModules,
    refetchInterval: 10_000,
  });
}

export function useTerraformResources() {
  return useQuery({
    queryKey: ['terraform', 'resources'],
    queryFn: terraformApi.fetchTerraformResources,
    refetchInterval: 10_000,
  });
}

export function useTerraformProviders() {
  return useQuery({
    queryKey: ['terraform', 'providers'],
    queryFn: terraformApi.fetchTerraformProviders,
    refetchInterval: 10_000,
  });
}

export function useTerraformOutputs() {
  return useQuery({
    queryKey: ['terraform', 'outputs'],
    queryFn: terraformApi.fetchTerraformOutputs,
    refetchInterval: 10_000,
  });
}

export function useTerraformPlan() {
  return useQuery({
    queryKey: ['terraform', 'plan'],
    queryFn: terraformApi.fetchTerraformPlan,
    refetchInterval: 10_000,
  });
}

export function useTerraformHealth() {
  return useQuery({
    queryKey: ['terraform', 'health'],
    queryFn: terraformApi.fetchTerraformHealth,
    refetchInterval: 10_000,
  });
}

export function useTerraformOverviewData() {
  return useQuery({
    queryKey: ['terraform', 'overview'],
    queryFn: terraformApi.fetchTerraformOverview,
    refetchInterval: 10_000,
  });
}

export function useTerraformOverview() {
  const overview = useTerraformOverviewData();
  const health = useTerraformHealth();
  const version = useTerraformVersion();
  const state = useTerraformState();
  const modules = useTerraformModules();
  const resources = useTerraformResources();
  const providers = useTerraformProviders();
  const outputs = useTerraformOutputs();
  const plan = useTerraformPlan();

  const isLoading = overview.isLoading || health.isLoading;
  const isError = overview.isError;

  const refetch = useCallback(() => {
    overview.refetch();
    health.refetch();
    version.refetch();
    state.refetch();
    modules.refetch();
    resources.refetch();
    providers.refetch();
    outputs.refetch();
    plan.refetch();
  }, [overview, health, version, state, modules, resources, providers, outputs, plan]);

  return {
    overview: overview.data,
    health: health.data,
    version: version.data,
    state: state.data,
    modules: modules.data,
    resources: resources.data,
    providers: providers.data,
    outputs: outputs.data,
    plan: plan.data,
    isLoading,
    isError,
    refetch,
  };
}
