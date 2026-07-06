import { api } from '@aegisai/utils';
import type {
  HelmRelease,
  HelmReleaseDetail,
  HelmHistory,
  HelmChart,
  HelmRepository,
  HelmDependency,
  HelmHealth,
  HelmOverview,
  HelmVersion,
  HelmValues,
} from '../types';

const BASE = '/api/helm';

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

export async function fetchHelmVersion(): Promise<HelmVersion> {
  return api.get<HelmVersion>(`${BASE}/version`);
}

export async function fetchHelmHealth(): Promise<HelmHealth> {
  return api.get<HelmHealth>(`${BASE}/health`);
}

export async function fetchHelmOverview(): Promise<HelmOverview> {
  return api.get<HelmOverview>(`${BASE}/overview`);
}

export async function fetchReleases(namespace?: string): Promise<HelmRelease[]> {
  return api.get<HelmRelease[]>(buildUrl('/releases', { namespace }));
}

export async function fetchRelease(name: string, namespace?: string): Promise<HelmReleaseDetail> {
  return api.get<HelmReleaseDetail>(buildUrl(`/releases/${name}`, { namespace }));
}

export async function fetchReleaseHistory(name: string, namespace?: string): Promise<HelmHistory[]> {
  return api.get<HelmHistory[]>(buildUrl(`/history/${name}`, { namespace }));
}

export async function fetchCharts(repo?: string): Promise<HelmChart[]> {
  return api.get<HelmChart[]>(buildUrl('/charts', { repo }));
}

export async function fetchRepositories(): Promise<HelmRepository[]> {
  return api.get<HelmRepository[]>(`${BASE}/repositories`);
}

export async function fetchReleaseValues(release: string, namespace?: string): Promise<HelmValues> {
  return api.get<HelmValues>(buildUrl(`/values/${encodeURIComponent(release)}`, { namespace }));
}

export async function fetchChartDependencies(chartRef: string): Promise<HelmDependency[]> {
  return api.get<HelmDependency[]>(`${BASE}/dependencies/${encodeURIComponent(chartRef)}`);
}
