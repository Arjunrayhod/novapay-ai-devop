import { api } from '@aegisai/utils';
import type {
  ClusterInfo,
  ClusterHealth,
  VersionInfo,
  NodeInfo,
  NamespaceInfo,
  PodInfo,
  DeploymentInfo,
  DaemonSetInfo,
  StatefulSetInfo,
  ServiceInfo,
  IngressInfo,
  PersistentVolumeInfo,
  PersistentVolumeClaimInfo,
  EventInfo,
  PodMetric,
  NodeMetric,
  ClusterMetrics,
} from '../types';

const BASE = '/api/kubernetes';

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return `${BASE}${path}`;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
}

export async function fetchVersion(): Promise<VersionInfo> {
  return api.get<VersionInfo>(`${BASE}/version`);
}

export async function fetchCluster(): Promise<ClusterInfo> {
  return api.get<ClusterInfo>(`${BASE}/cluster`);
}

export async function fetchHealth(): Promise<ClusterHealth> {
  return api.get<ClusterHealth>(`${BASE}/health`);
}

export async function fetchNodes(): Promise<NodeInfo[]> {
  return api.get<NodeInfo[]>(`${BASE}/nodes`);
}

export async function fetchNamespaces(): Promise<NamespaceInfo[]> {
  return api.get<NamespaceInfo[]>(`${BASE}/namespaces`);
}

export async function fetchPods(namespace?: string): Promise<PodInfo[]> {
  return api.get<PodInfo[]>(buildUrl('/pods', { namespace }));
}

export async function fetchDeployments(namespace?: string): Promise<DeploymentInfo[]> {
  return api.get<DeploymentInfo[]>(buildUrl('/deployments', { namespace }));
}

export async function fetchDaemonSets(namespace?: string): Promise<DaemonSetInfo[]> {
  return api.get<DaemonSetInfo[]>(buildUrl('/daemonsets', { namespace }));
}

export async function fetchStatefulSets(namespace?: string): Promise<StatefulSetInfo[]> {
  return api.get<StatefulSetInfo[]>(buildUrl('/statefulsets', { namespace }));
}

export async function fetchServices(namespace?: string): Promise<ServiceInfo[]> {
  return api.get<ServiceInfo[]>(buildUrl('/services', { namespace }));
}

export async function fetchIngresses(namespace?: string): Promise<IngressInfo[]> {
  return api.get<IngressInfo[]>(buildUrl('/ingress', { namespace }));
}

export async function fetchPersistentVolumes(): Promise<PersistentVolumeInfo[]> {
  return api.get<PersistentVolumeInfo[]>(`${BASE}/persistentvolumes`);
}

export async function fetchPersistentVolumeClaims(namespace?: string): Promise<PersistentVolumeClaimInfo[]> {
  return api.get<PersistentVolumeClaimInfo[]>(buildUrl('/persistentvolumeclaims', { namespace }));
}

export async function fetchEvents(namespace?: string, limit?: number): Promise<EventInfo[]> {
  return api.get<EventInfo[]>(buildUrl('/events', { namespace, limit }));
}

export async function fetchPodMetrics(namespace?: string): Promise<PodMetric[]> {
  return api.get<PodMetric[]>(buildUrl('/metrics/pods', { namespace }));
}

export async function fetchNodeMetrics(): Promise<NodeMetric[]> {
  return api.get<NodeMetric[]>(`${BASE}/metrics/nodes`);
}

export async function fetchClusterMetrics(): Promise<ClusterMetrics> {
  return api.get<ClusterMetrics>(`${BASE}/metrics`);
}
