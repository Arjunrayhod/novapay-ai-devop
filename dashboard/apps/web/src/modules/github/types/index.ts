export interface GitHubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  description: string;
  default_branch: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  license: {
    spdx_id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  workflow_id: number;
  actor: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  assets: {
    name: string;
    download_count: number;
    size: number;
  }[];
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface DevTool {
  name: string;
  installed: boolean;
  version: string | null;
  path: string | null;
}

export interface InstallCommand {
  tool_name: string;
  provider: string;
  command: string;
  description: string | null;
}

export interface RepoHealth {
  current_branch: string;
  working_tree_clean: boolean;
  modified_files: number;
  untracked_files: number;
  ahead: number;
  behind: number;
  last_pull: string | null;
  last_push: string | null;
  health_score: number;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

export interface WorkflowRunJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  steps: {
    name: string;
    status: string;
    conclusion: string | null;
    number: number;
  }[];
}

export interface GithubData {
  repo: GitHubRepo | null;
  commits: GitHubCommit[];
  workflowRuns: GitHubWorkflowRun[];
  releases: GitHubRelease[];
  contributors: GitHubContributor[];
  pullRequests: GitHubPullRequest[];
  commitCount: number;
}
