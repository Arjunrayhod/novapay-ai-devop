import { api } from '@aegisai/utils';
import type { GitHubWorkflow, GitHubWorkflowRun, WorkflowRunJob } from '../types';

export async function fetchWorkflows(): Promise<GitHubWorkflow[]> {
  return api.get<GitHubWorkflow[]>('/api/v1/github/workflows');
}

export async function dispatchWorkflow(workflowId: number, ref = 'main'): Promise<void> {
  await api.post(`/api/v1/github/workflows/${workflowId}/dispatch`, { ref });
}

export async function fetchWorkflowRuns(workflowId?: number): Promise<GitHubWorkflowRun[]> {
  const params = workflowId ? `?workflow_id=${workflowId}` : '';
  return api.get<GitHubWorkflowRun[]>(`/api/v1/github/workflows/runs${params}`);
}

export async function fetchRunJobs(runId: number): Promise<WorkflowRunJob[]> {
  return api.get<WorkflowRunJob[]>(`/api/v1/github/workflows/runs/${runId}/jobs`);
}
