import { api } from '@aegisai/utils';
import type {
  ComplianceReport,
  DependencyAuditResult,
  Policy,
  PolicyEvaluation,
  SastScanResult,
  SecurityHealth,
  SecurityOverview,
  VulnerabilitySummary,
} from '../types';

const BASE = '/api/security';

export async function fetchSecurityHealth(): Promise<SecurityHealth> {
  return api.get<SecurityHealth>(`${BASE}/health`);
}

export async function fetchSecurityOverview(): Promise<SecurityOverview> {
  return api.get<SecurityOverview>(`${BASE}/overview`);
}

export async function fetchSastScan(target = ''): Promise<SastScanResult> {
  const q = target ? `?target=${encodeURIComponent(target)}` : '';
  return api.get<SastScanResult>(`${BASE}/sast/scan${q}`);
}

export async function fetchDependencyAudit(): Promise<DependencyAuditResult> {
  return api.get<DependencyAuditResult>(`${BASE}/dependencies`);
}

export async function fetchVulnerabilitySummary(): Promise<VulnerabilitySummary> {
  return api.get<VulnerabilitySummary>(`${BASE}/vulnerabilities`);
}

export async function fetchPolicies(): Promise<Policy[]> {
  return api.get<Policy[]>(`${BASE}/policies`);
}

export async function fetchPolicyEvaluation(): Promise<PolicyEvaluation[]> {
  return api.get<PolicyEvaluation[]>(`${BASE}/policies/evaluate`);
}

export async function fetchComplianceReport(): Promise<ComplianceReport> {
  return api.get<ComplianceReport>(`${BASE}/compliance`);
}
