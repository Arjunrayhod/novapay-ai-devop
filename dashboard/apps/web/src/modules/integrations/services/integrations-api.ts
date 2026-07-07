import { api } from '@aegisai/utils';

export interface ProviderMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  version: string;
  docs_url: string;
}

export interface IntegrationStatus {
  provider: string;
  connected: boolean;
  status: string;
  health: string;
  version: string;
  last_sync: string | null;
  last_error: string | null;
}

export interface IntegrationDetail {
  provider: ProviderMeta;
  connection: IntegrationStatus;
  config_fields: Array<{ key: string; label: string; type: string; required: boolean; default?: string }>;
  masked_credentials: Record<string, string>;
}

export interface ConnectResponse {
  provider: string;
  status: string;
  message: string;
  masked_credentials: Record<string, string>;
}

export interface TestResponse {
  provider: string;
  success: boolean;
  message: string;
  latency_ms: number | null;
}

export interface SyncResponse {
  provider: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface WorkspaceReadiness {
  total: number;
  connected: number;
  score: number;
  integrations: IntegrationStatus[];
}

export interface IntegrationListResponse {
  integrations: IntegrationDetail[];
  workspace_readiness: WorkspaceReadiness;
}

export async function fetchIntegrations(): Promise<IntegrationListResponse> {
  return api.get('/api/integrations');
}

export async function fetchIntegration(providerId: string): Promise<IntegrationDetail> {
  return api.get(`/api/integrations/${providerId}`);
}

export async function connectIntegration(
  providerId: string,
  credentials: Record<string, string>,
  config?: Record<string, unknown>,
): Promise<ConnectResponse> {
  return api.post(`/api/integrations/${providerId}/connect`, {
    credentials,
    config: config ?? {},
  });
}

export async function disconnectIntegration(providerId: string): Promise<ConnectResponse> {
  return api.post(`/api/integrations/${providerId}/disconnect`);
}

export async function testIntegration(
  providerId: string,
  credentials: Record<string, string>,
): Promise<TestResponse> {
  return api.post(`/api/integrations/${providerId}/test`, {
    credentials,
    config: {},
  });
}

export async function syncIntegration(providerId: string): Promise<SyncResponse> {
  return api.post(`/api/integrations/${providerId}/sync`);
}

export async function fetchWorkspaceReadiness(): Promise<WorkspaceReadiness> {
  return api.get('/api/workspace-readiness');
}
