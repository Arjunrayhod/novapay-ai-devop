import { api } from '@aegisai/utils';
import type {
  GitHubRepo,
  GitHubCommit,
  GitHubWorkflowRun,
  GitHubRelease,
  GitHubContributor,
  GitHubPullRequest,
} from '../types';

const BACKEND_PREFIX = '/api/v1/github';

export async function fetchRepo(): Promise<GitHubRepo | null> {
  const repos = await api.get<GitHubRepo[]>(`${BACKEND_PREFIX}/repos`);
  return repos[0] ?? null;
}

export async function fetchCommits(page = 1, perPage = 10): Promise<GitHubCommit[]> {
  return api.get<GitHubCommit[]>(`${BACKEND_PREFIX}/commits?page=${page}&per_page=${perPage}`);
}

export async function fetchWorkflowRuns(): Promise<GitHubWorkflowRun[]> {
  return api.get<GitHubWorkflowRun[]>(`${BACKEND_PREFIX}/workflows/runs?per_page=10`);
}

export async function fetchReleases(): Promise<GitHubRelease[]> {
  return api.get<GitHubRelease[]>(`${BACKEND_PREFIX}/releases?per_page=5`);
}

export async function fetchContributors(): Promise<GitHubContributor[]> {
  return api.get<GitHubContributor[]>(`${BACKEND_PREFIX}/contributors?per_page=10`);
}

export async function fetchPullRequests(): Promise<GitHubPullRequest[]> {
  return api.get<GitHubPullRequest[]>(`${BACKEND_PREFIX}/pulls?state=open&per_page=10`);
}

export async function fetchCommitCount(): Promise<number> {
  return 150;
}

export async function fetchLatestCommit(): Promise<GitHubCommit | null> {
  return null;
}

export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  return null;
}
