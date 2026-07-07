import { api } from '@aegisai/utils';
import type { SystemInfo, ToolInfo, ValidationResult, HealthScore, EnvironmentReport } from '../types';

const BASE = '/api/environment';

export async function fetchSystemInfo(): Promise<SystemInfo> {
  return api.get<SystemInfo>(`${BASE}/system`);
}

export async function fetchTools(): Promise<ToolInfo[]> {
  return api.get<ToolInfo[]>(`${BASE}/tools`);
}

export async function fetchValidation(): Promise<ValidationResult[]> {
  return api.get<ValidationResult[]>(`${BASE}/validation`);
}

export async function fetchHealth(): Promise<HealthScore> {
  return api.get<HealthScore>(`${BASE}/health`);
}

export async function fetchReport(): Promise<EnvironmentReport> {
  return api.get<EnvironmentReport>(`${BASE}/report`);
}
