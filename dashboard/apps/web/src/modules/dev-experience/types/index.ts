export interface ScanToolInfo {
  name: string;
  installed: boolean;
  version: string | null;
  latest_version: string | null;
  path: string | null;
  error: string | null;
}

export interface ScanSystemInfo {
  os: string;
  architecture: string;
  hostname: string;
  username: string;
  cpu: string;
  cpu_cores: number;
  cpu_frequency: string;
  ram_total: number;
  ram_available: number;
  ram_percent: number;
  disk_total: number;
  disk_used: number;
  disk_free: number;
  disk_percent: number;
}

export interface ScanResult {
  system: ScanSystemInfo | null;
  tools: ScanToolInfo[];
  scan_timestamp: string;
}

export interface PathEntry {
  directory: string;
  status: 'valid' | 'missing' | 'duplicate' | 'inaccessible';
  note: string | null;
}

export interface PathSummary {
  total: number;
  valid: number;
  missing: number;
  duplicate: number;
  inaccessible: number;
}

export interface PathValidationResult {
  entries: PathEntry[];
  summary: PathSummary;
}

export interface InstallCommand {
  tool_name: string;
  provider: string;
  command: string;
  description: string | null;
}

export interface InstallCommandsResult {
  missing_tools: string[];
  commands: InstallCommand[];
}

export interface AISuggestion {
  severity: 'critical' | 'warning' | 'info';
  reason: string;
  recommendation: string;
  suggested_fix: string;
  tool_name: string | null;
}

export interface AISuggestionsResult {
  suggestions: AISuggestion[];
}

export interface ReadinessScore {
  overall: number;
  tools_installed: number;
  tools_missing: number;
  total_tools: number;
  path_issues: number;
  critical_issues: number;
}

export interface DiagnosticReport {
  generated_at: string;
  system: ScanSystemInfo | null;
  tools: ScanToolInfo[];
  path_validation: PathValidationResult;
  suggestions: AISuggestion[];
  install_commands: InstallCommand[];
  summary: ReadinessScore;
}
