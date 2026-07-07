'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { ExternalLink, GitCommit } from 'lucide-react';
import type { GitHubCommit } from '../types';

interface GitHubRecentCommitsProps {
  commits?: GitHubCommit[];
  repoUrl?: string;
  isLoading?: boolean;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

function timeAgo(date: string): string {
  const now = Date.now();
  const ms = now - new Date(date).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function GitHubRecentCommits({ commits, repoUrl, isLoading }: GitHubRecentCommitsProps) {
  if (isLoading || !commits) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (commits.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Recent Commits
          </h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitCommit className="h-8 w-8 mb-2" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No commits found
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Recent Commits
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Latest {commits.length} commits
        </p>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
          {commits.map((commit) => (
            <div key={commit.sha} className="flex items-start gap-3 px-4 py-3 transition-colors hover-bg">
              <div className="shrink-0">
                {commit.author ? (
                  <img
                    src={commit.author.avatar_url}
                    alt={commit.author.login}
                    className="h-7 w-7 rounded-full"
                  />
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 text-xs font-medium"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    ?
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {commit.commit.message.split('\n')[0]}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {commit.author?.login ?? commit.commit.author.name}
                  </span>
                  <span className="font-mono">{shortSha(commit.sha)}</span>
                  <span>{timeAgo(commit.commit.author.date)}</span>
                </div>
              </div>
              {repoUrl && (
                <a
                  href={`${repoUrl}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded p-1 transition-colors hover-bg"
                >
                  <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </a>
              )}
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
