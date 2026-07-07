export interface HelmRelease {
  name: string;
  namespace: string;
  chart: string;
  version: string;
  appVersion: string;
  status: HelmReleaseStatus;
  revision: number;
  updated: string;
  description: string;
  values: Record<string, unknown>;
}

export type HelmReleaseStatus = 'deployed' | 'pending' | 'failed' | 'unknown' | 'uninstalled' | 'superseded';

export interface HelmChart {
  name: string;
  path: string;
  version: string;
  appVersion: string;
  description: string;
  type: string;
  dependencies: HelmDependency[];
  values: HelmValues;
  hasSchema: boolean;
}

export interface HelmDependency {
  name: string;
  version: string;
  repository: string;
  status: string;
}

export interface HelmValues {
  required: string[];
  optional: Record<string, unknown>;
  defaults: Record<string, unknown>;
}

export interface HelmValidation {
  chart: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}
