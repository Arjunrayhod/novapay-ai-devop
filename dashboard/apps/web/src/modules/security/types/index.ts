export interface SastIssue {
  file: string;
  line: number;
  severity: string;
  check_id: string;
  message: string;
  code_snippet: string;
}

export interface SastScanResult {
  tool: string;
  issues: SastIssue[];
  total_issues: number;
  scan_time_ms: number;
  files_scanned: number;
}

export interface DependencyVulnerability {
  package: string;
  installed_version: string;
  vulnerable_versions: string;
  severity: string;
  advisory: string;
  cve: string;
}

export interface DependencyAuditResult {
  total_packages: number;
  vulnerable_count: number;
  vulnerabilities: DependencyVulnerability[];
}

export interface VulnerabilitySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  sources: string[];
}

export interface Policy {
  name: string;
  path: string;
  status: string;
  rules_count: number;
  last_evaluated: string;
}

export interface PolicyEvaluation {
  policy: string;
  passed: boolean;
  violations: string[];
  duration_ms: number;
}

export interface ComplianceCheck {
  framework: string;
  status: string;
  passed: number;
  failed: number;
  total: number;
  score: number;
}

export interface ComplianceReport {
  overall_score: number;
  checks: ComplianceCheck[];
}

export interface SecurityHealth {
  sast: string;
  dependency_scan: string;
  vulnerability_db: string;
  opa: string;
  trivy: string;
}

export interface SecurityOverview {
  sast_available: boolean;
  dependency_scan_available: boolean;
  vulnerability_db_available: boolean;
  opa_available: boolean;
  trivy_available: boolean;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  policy_count: number;
  compliance_score: number;
}
