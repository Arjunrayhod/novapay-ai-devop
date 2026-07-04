export interface Environment {
  name: string;
  type: 'dev' | 'staging' | 'prod' | 'lab';
  status: EnvironmentStatus;
  services: EnvironmentService[];
  kubernetes: {
    connected: boolean;
    clusterVersion: string;
    namespaces: number;
    pods: number;
  };
  docker: {
    connected: boolean;
    containers: number;
    images: number;
    composeRunning: boolean;
  };
  terraform: {
    initialized: boolean;
    workspaces: number;
    lastValidation: string | null;
  };
  helm: {
    charts: number;
    releases: number;
  };
  observability: {
    prometheus: boolean;
    grafana: boolean;
    loki: boolean;
    tempo: boolean;
  };
  lastScan: string | null;
}

export type EnvironmentStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface EnvironmentService {
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  port: number;
  url: string;
  version: string;
}

export interface EnvironmentScanResult {
  id: string;
  timestamp: string;
  environment: string;
  status: 'passed' | 'failed' | 'warning';
  checks: EnvironmentCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export interface EnvironmentCheck {
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  duration: string;
  details?: string;
}
