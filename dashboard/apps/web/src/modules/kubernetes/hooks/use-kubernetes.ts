'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as k8sApi from '../services/k8s-api';

export function useKubernetesVersion() {
  return useQuery({
    queryKey: ['kubernetes', 'version'],
    queryFn: k8sApi.fetchVersion,
    refetchOnWindowFocus: false,
  });
}

export function useKubernetesCluster() {
  return useQuery({
    queryKey: ['kubernetes', 'cluster'],
    queryFn: k8sApi.fetchCluster,
    refetchOnWindowFocus: false,
  });
}

export function useKubernetesHealth() {
  return useQuery({
    queryKey: ['kubernetes', 'health'],
    queryFn: k8sApi.fetchHealth,
    refetchInterval: 15_000,
  });
}

export function useNodes() {
  return useQuery({
    queryKey: ['kubernetes', 'nodes'],
    queryFn: k8sApi.fetchNodes,
    refetchInterval: 15_000,
  });
}

export function useNamespaces() {
  return useQuery({
    queryKey: ['kubernetes', 'namespaces'],
    queryFn: k8sApi.fetchNamespaces,
    refetchOnWindowFocus: false,
  });
}

export function usePods(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'pods', namespace],
    queryFn: () => k8sApi.fetchPods(namespace),
    refetchInterval: 5_000,
  });
}

export function useDeployments(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'deployments', namespace],
    queryFn: () => k8sApi.fetchDeployments(namespace),
    refetchInterval: 10_000,
  });
}

export function useDaemonSets(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'daemonsets', namespace],
    queryFn: () => k8sApi.fetchDaemonSets(namespace),
    refetchInterval: 10_000,
  });
}

export function useStatefulSets(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'statefulsets', namespace],
    queryFn: () => k8sApi.fetchStatefulSets(namespace),
    refetchInterval: 10_000,
  });
}

export function useServices(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'services', namespace],
    queryFn: () => k8sApi.fetchServices(namespace),
    refetchInterval: 15_000,
  });
}

export function useIngresses(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'ingress', namespace],
    queryFn: () => k8sApi.fetchIngresses(namespace),
    refetchInterval: 15_000,
  });
}

export function usePersistentVolumes() {
  return useQuery({
    queryKey: ['kubernetes', 'persistentvolumes'],
    queryFn: k8sApi.fetchPersistentVolumes,
    refetchOnWindowFocus: false,
  });
}

export function usePersistentVolumeClaims(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'persistentvolumeclaims', namespace],
    queryFn: () => k8sApi.fetchPersistentVolumeClaims(namespace),
    refetchOnWindowFocus: false,
  });
}

export function useEvents(namespace?: string, limit?: number) {
  return useQuery({
    queryKey: ['kubernetes', 'events', namespace, limit],
    queryFn: () => k8sApi.fetchEvents(namespace, limit),
    refetchInterval: 10_000,
  });
}

export function usePodMetrics(namespace?: string) {
  return useQuery({
    queryKey: ['kubernetes', 'metrics', 'pods', namespace],
    queryFn: () => k8sApi.fetchPodMetrics(namespace),
    refetchInterval: 10_000,
  });
}

export function useNodeMetrics() {
  return useQuery({
    queryKey: ['kubernetes', 'metrics', 'nodes'],
    queryFn: k8sApi.fetchNodeMetrics,
    refetchInterval: 10_000,
  });
}

export function useClusterMetrics() {
  return useQuery({
    queryKey: ['kubernetes', 'metrics', 'cluster'],
    queryFn: k8sApi.fetchClusterMetrics,
    refetchInterval: 10_000,
  });
}

export function useKubernetesOverview() {
  const cluster = useKubernetesCluster();
  const health = useKubernetesHealth();
  const version = useKubernetesVersion();
  const nodes = useNodes();
  const namespaces = useNamespaces();
  const pods = usePods();
  const deployments = useDeployments();
  const services = useServices();
  const pvs = usePersistentVolumes();
  const events = useEvents('', 50);
  const metrics = useClusterMetrics();

  const isLoading = cluster.isLoading || health.isLoading;
  const isError = cluster.isError;

  const refetch = useCallback(() => {
    cluster.refetch();
    health.refetch();
    version.refetch();
    nodes.refetch();
    namespaces.refetch();
    pods.refetch();
    deployments.refetch();
    services.refetch();
    pvs.refetch();
    events.refetch();
    metrics.refetch();
  }, [cluster, health, version, nodes, namespaces, pods, deployments, services, pvs, events, metrics]);

  return {
    cluster: cluster.data,
    health: health.data,
    version: version.data,
    nodes: nodes.data,
    namespaces: namespaces.data,
    pods: pods.data,
    deployments: deployments.data,
    services: services.data,
    persistentVolumes: pvs.data,
    events: events.data,
    metrics: metrics.data,
    isLoading,
    isError,
    refetch,
  };
}
