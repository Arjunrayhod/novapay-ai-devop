export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'disabled' | 'deleted';
  lastRun: GitHubRun | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRun {
  id: number;
  name: string;
  headBranch: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  workflowName: string;
  actor: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  author: string;
  branch: string;
  base: string;
  status: 'open' | 'closed' | 'merged';
  checks: GitHubCheckRun[];
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubCheckRun {
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface GitHubRelease {
  tag: string;
  name: string;
  author: string;
  isPrerelease: boolean;
  createdAt: string;
  htmlUrl: string;
  assets: number;
}

export interface CIStatus {
  workflows: GitHubWorkflow[];
  lastRunStatus: 'success' | 'failure' | 'running' | 'unknown';
  lastRunAt: string | null;
  successRate: number;
  totalRuns: number;
}
