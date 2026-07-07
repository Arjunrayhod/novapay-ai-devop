export interface HelmRelease {
  name: string;
  namespace: string;
  revision: number;
  chart: string;
  app_version: string;
  status: string;
  updated: string;
}

export interface HelmReleaseDetail {
  name: string;
  namespace: string;
  revision: number;
  chart: string;
  app_version: string;
  status: string;
  updated: string;
  description: string;
  chart_metadata: Record<string, unknown>;
}

export interface HelmHistory {
  revision: number;
  status: string;
  description: string;
  date: string;
  chart: string;
  app_version: string;
}

export interface HelmChart {
  name: string;
  version: string;
  app_version: string;
  description: string;
  type_field: string;
  repo: string;
}

export interface HelmRepository {
  name: string;
  url: string;
  status: string;
}

export interface HelmDependency {
  name: string;
  version: string;
  condition: string;
  repository: string;
  enabled: boolean;
}

export interface HelmHealth {
  helm_installed: boolean;
  cli_version: string;
  repositories_ok: number;
  repositories_total: number;
  releases_ok: number;
  releases_total: number;
  chart_count: number;
}

export interface HelmOverview {
  total_releases: number;
  healthy_releases: number;
  failed_releases: number;
  namespace_count: number;
  repository_count: number;
  chart_count: number;
}

export interface HelmVersion {
  version: string;
}

export interface HelmValues {
  release: string;
  values: string;
}
