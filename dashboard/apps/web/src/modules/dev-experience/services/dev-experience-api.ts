import { api } from '@aegisai/utils';
import type {
  ScanResult,
  PathValidationResult,
  InstallCommandsResult,
  AISuggestionsResult,
  DiagnosticReport,
} from '../types';

const BASE = '/api/dev-experience';

export async function fetchScan(): Promise<ScanResult> {
  return api.get<ScanResult>(`${BASE}/scan`);
}

export async function fetchPathValidation(): Promise<PathValidationResult> {
  return api.get<PathValidationResult>(`${BASE}/path`);
}

export async function fetchInstallCommands(): Promise<InstallCommandsResult> {
  return api.get<InstallCommandsResult>(`${BASE}/install-commands`);
}

export async function fetchAISuggestions(): Promise<AISuggestionsResult> {
  return api.get<AISuggestionsResult>(`${BASE}/ai-suggestions`);
}

export async function fetchReport(): Promise<DiagnosticReport> {
  return api.get<DiagnosticReport>(`${BASE}/report`);
}
