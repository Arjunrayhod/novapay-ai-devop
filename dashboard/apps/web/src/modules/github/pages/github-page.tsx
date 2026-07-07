'use client';

import { useState, useEffect } from 'react';
import {
  DashboardLayout,
  PageContainer,
  PageHeader,
} from '@aegisai/ui';
import { RefreshCw, AlertTriangle, Github, Settings } from 'lucide-react';
import { api } from '@aegisai/utils';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useGitHub } from '../hooks/use-github';
import { GitHubBranding } from '../components/github-branding';
import { GitHubRepoStats } from '../components/github-repo-stats';
import { GitHubActionsPanel } from '../components/github-actions-panel';
import { GitHubRecentCommits } from '../components/github-recent-commits';
import { GitHubWorkflowRuns } from '../components/github-workflow-runs';
import { GitHubWorkflowRunner } from '../components/github-workflow-runner';
import { GitHubReleases } from '../components/github-releases';
import { GitHubContributors } from '../components/github-contributors';

export function GitHubPage() {
  const { token } = useAuth();
  const [ghConnected, setGhConnected] = useState<boolean | null>(null);
  const [checkingConn, setCheckingConn] = useState(true);

  useEffect(() => {
    if (!token) { setCheckingConn(false); setGhConnected(false); return; }
    api.get<{ connected: boolean }>('/api/v1/github/connection')
      .then((data) => setGhConnected(data.connected ?? false))
      .catch(() => setGhConnected(false))
      .finally(() => setCheckingConn(false));
  }, [token]);

  const {
    repo, commits, workflowRuns, releases,
    contributors, pullRequests,
    isLoading, isError, refetch,
  } = useGitHub();

  if (checkingConn) {
    return (
      <DashboardLayout activeItem="github">
        <PageContainer>
          <PageHeader
            title="GitHub"
            description="GitHub repository management, pull requests, actions, and insights"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'GitHub' }]}
          />
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (ghConnected === false) {
    return (
      <DashboardLayout activeItem="github">
        <PageContainer>
          <PageHeader
            title="GitHub"
            description="GitHub repository management, pull requests, actions, and insights"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'GitHub' }]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Github className="h-16 w-16 mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              GitHub not connected
            </h2>
            <p className="mt-2 text-sm max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
              Connect your GitHub account to view your repositories, workflows, and pull requests.
            </p>
            <a
              href="/settings"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            >
              <Settings className="h-4 w-4" /> Connect GitHub
            </a>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem="github">
      <PageContainer>
        <PageHeader
          title="GitHub"
          description="GitHub repository management, pull requests, actions, and insights"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'GitHub' }]}
        />

        <div className="mt-6 space-y-6">
          <GitHubBranding repo={repo ?? undefined} isLoading={isLoading} />

          <GitHubRepoStats
            repo={repo ?? undefined}
            contributors={contributors}
            pullRequests={pullRequests}
            isLoading={isLoading}
          />

          <GitHubActionsPanel repo={repo ?? undefined} />

          {isError && (
            <div className="flex items-center justify-between rounded-lg border border-danger-500/20 bg-danger-500/5 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-danger-400 shrink-0" />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Some data failed to load. <button onClick={() => refetch()} className="underline font-medium" style={{ color: 'var(--color-text-primary)' }}>Retry</button>
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-lg border p-2 transition-colors hover-bg"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          )}

          <GitHubWorkflowRunner />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GitHubRecentCommits
              commits={commits}
              repoUrl={repo?.html_url}
              isLoading={isLoading}
            />
            <GitHubWorkflowRuns
              runs={workflowRuns}
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GitHubReleases
              releases={releases}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
            />
            <GitHubContributors
              contributors={contributors}
              isLoading={isLoading}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
