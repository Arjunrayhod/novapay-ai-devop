'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Users } from 'lucide-react';
import type { GitHubContributor } from '../types';

interface GitHubContributorsProps {
  contributors?: GitHubContributor[];
  isLoading?: boolean;
}

export function GitHubContributors({ contributors, isLoading }: GitHubContributorsProps) {
  if (isLoading || !contributors) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-wrap gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-3 w-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (contributors.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Contributors
          </h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 mb-2" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No contributors found
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
          Contributors
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Top {contributors.length} contributors
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {contributors.map((contributor) => (
            <a
              key={contributor.login}
              href={`https://github.com/${contributor.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all hover-bg"
              style={{ borderColor: 'var(--color-border-light)' }}
            >
              <img
                src={contributor.avatar_url}
                alt={contributor.login}
                className="h-10 w-10 rounded-full ring-2 ring-primary-500/10"
              />
              <span className="text-xs font-medium text-center truncate w-full" style={{ color: 'var(--color-text-primary)' }}>
                {contributor.login}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {contributor.contributions} commits
              </span>
            </a>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
