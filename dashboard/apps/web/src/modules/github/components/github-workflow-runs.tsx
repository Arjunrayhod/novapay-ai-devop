'use client';

import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { ExternalLink, Play, Square, Clock, User } from 'lucide-react';
import type { GitHubWorkflowRun } from '../types';

interface GitHubWorkflowRunsProps {
  runs?: GitHubWorkflowRun[];
  isLoading?: boolean;
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s`;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function GitHubWorkflowRuns({ runs, isLoading }: GitHubWorkflowRunsProps) {
  if (isLoading || !runs) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (runs.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            GitHub Actions
          </h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Play className="h-8 w-8 mb-2" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No workflow runs found
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const statusColor = (status: string, conclusion: string | null) => {
    if (conclusion === 'success') return 'success' as const;
    if (conclusion === 'failure') return 'danger' as const;
    if (status === 'in_progress') return 'warning' as const;
    return 'neutral' as const;
  };

  const statusLabel = (status: string, conclusion: string | null) => {
    if (conclusion === 'success') return 'Passed';
    if (conclusion === 'failure') return 'Failed';
    if (status === 'in_progress') return 'Running';
    if (status === 'queued') return 'Queued';
    return conclusion ?? status;
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          GitHub Actions
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Recent workflow runs
        </p>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
          {runs.map((run) => (
            <div key={run.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover-bg">
              <div className="mt-0.5 shrink-0">
                {run.status === 'in_progress' ? (
                  <Square className="h-4 w-4 text-warning-500" />
                ) : (
                  <Play className="h-4 w-4" style={{ color: run.conclusion === 'success' ? 'var(--color-success-500)' : 'var(--color-danger-400)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {run.name || 'Workflow'}
                  </span>
                  <StatusBadge status={statusColor(run.status, run.conclusion)} dot={false}>
                    {statusLabel(run.status, run.conclusion)}
                  </StatusBadge>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {run.actor?.login ?? 'unknown'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(run.run_started_at, run.updated_at)}
                  </span>
                  <span className="font-mono">{shortSha(run.head_sha)}</span>
                  <span>{run.head_branch}</span>
                </div>
              </div>
              <a
                href={run.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded p-1 transition-colors hover-bg"
              >
                <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
              </a>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
