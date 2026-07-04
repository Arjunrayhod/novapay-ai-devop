export interface Vulnerability {
  id: string;
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fixedIn: string;
  status: 'open' | 'fixed' | 'accepted';
  discoveredAt: string;
  cvss: number;
}

export interface SecurityScan {
  id: string;
  type: 'sast' | 'sca' | 'container' | 'iac' | 'secret';
  status: 'running' | 'completed' | 'failed';
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  startedAt: string;
  completedAt: string | null;
}

export interface ComplianceCheck {
  framework: string;
  control: string;
  status: 'passed' | 'failed' | 'not_applicable';
  description: string;
  evidence: string | null;
}

export interface Secret {
  name: string;
  type: string;
  key: string;
  rotated: string;
  expires: string | null;
}
