import { api } from '@aegisai/utils';

export interface GitHubConnectionStatus {
  connected: boolean;
  github_username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TestConnectionResult {
  valid: boolean;
  github_username: string;
}

export async function getGitHubConnection(_token: string): Promise<GitHubConnectionStatus> {
  return api.get<GitHubConnectionStatus>('/api/v1/github/connection');
}

export async function testGitHubConnection(_token: string, githubUsername: string, pat: string): Promise<TestConnectionResult> {
  return api.post<TestConnectionResult>('/api/v1/github/connection/test', { github_username: githubUsername, token: pat });
}

export async function saveGitHubConnection(_token: string, githubUsername: string, pat: string): Promise<GitHubConnectionStatus> {
  return api.post<GitHubConnectionStatus>('/api/v1/github/connection', { github_username: githubUsername, token: pat });
}

export async function deleteGitHubConnection(_token: string): Promise<{ connected: boolean }> {
  return api.delete<{ connected: boolean }>('/api/v1/github/connection');
}
