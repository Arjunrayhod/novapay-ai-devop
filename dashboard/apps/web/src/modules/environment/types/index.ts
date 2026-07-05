export interface ToolInfo {
  name: string;
  installed: boolean;
  version: string | null;
  latest_version: string | null;
  path: string | null;
  error: string | null;
}

export interface SystemInfo {
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

export interface ValidationResult {
  check: string;
  status: 'PASS' | 'WARNING' | 'FAILED' | 'SKIPPED';
  message: string;
  details?: Record<string, unknown>;
}

export interface HealthScoreBreakdown {
  infrastructure: number;
  development: number;
  cloud: number;
  monitoring: number;
}

export interface HealthScore {
  overall: number;
  breakdown: HealthScoreBreakdown;
}

export interface EnvironmentReport {
  system: SystemInfo;
  tools: ToolInfo[];
  validation: ValidationResult[];
  health: HealthScore;
  generated_at: string;
}
