'use client';

import { GlassCard, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { ExternalLink, GitBranch, Eye, Lock, Globe } from 'lucide-react';
import type { GitHubRepo } from '../types';

interface GitHubBrandingProps {
  repo?: GitHubRepo;
  isLoading?: boolean;
}

export function GitHubBranding({ repo, isLoading }: GitHubBrandingProps) {
  if (isLoading || !repo) {
    return (
      <GlassCard>
        <GlassCardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-96 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-6 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <a
            href={repo.owner.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0"
          >
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="h-16 w-16 rounded-full ring-2 ring-primary-500/20 transition-shadow group-hover:ring-primary-500/40"
            />
          </a>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5"
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {repo.owner.login} / {repo.name}
                </h2>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-primary-400" />
              </a>
              <StatusBadge status={repo.private ? 'warning' : 'success'} dot={false}>
                {repo.private ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                {repo.private ? 'Private' : 'Public'}
              </StatusBadge>
            </div>
            {repo.description && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {repo.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span className="inline-flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5" />
                {repo.default_branch}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {repo.watchers_count} watchers
              </span>
              <span>
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
