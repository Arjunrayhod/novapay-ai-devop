import { api } from '@aegisai/utils';
import type {
  TerraformVersion,
  TerraformState,
  TerraformModule,
  TerraformResource,
  TerraformProvider,
  TerraformOutput,
  TerraformPlan,
  TerraformHealth,
  TerraformOverview,
} from '../types';

const BASE = '/api/terraform';

export async function fetchTerraformVersion(): Promise<TerraformVersion> {
  return api.get<TerraformVersion>(`${BASE}/version`);
}

export async function fetchTerraformState(): Promise<TerraformState> {
  return api.get<TerraformState>(`${BASE}/state`);
}

export async function fetchTerraformModules(): Promise<TerraformModule[]> {
  return api.get<TerraformModule[]>(`${BASE}/modules`);
}

export async function fetchTerraformResources(): Promise<TerraformResource[]> {
  return api.get<TerraformResource[]>(`${BASE}/resources`);
}

export async function fetchTerraformProviders(): Promise<TerraformProvider[]> {
  return api.get<TerraformProvider[]>(`${BASE}/providers`);
}

export async function fetchTerraformOutputs(): Promise<TerraformOutput[]> {
  return api.get<TerraformOutput[]>(`${BASE}/outputs`);
}

export async function fetchTerraformPlan(): Promise<TerraformPlan> {
  return api.get<TerraformPlan>(`${BASE}/plan`);
}

export async function fetchTerraformHealth(): Promise<TerraformHealth> {
  return api.get<TerraformHealth>(`${BASE}/health`);
}

export async function fetchTerraformOverview(): Promise<TerraformOverview> {
  return api.get<TerraformOverview>(`${BASE}/overview`);
}
