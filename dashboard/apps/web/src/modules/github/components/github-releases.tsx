'use client';

import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { Package, ExternalLink, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import type { GitHubRelease } from '../types';

interface GitHubReleasesProps {
  releases?: GitHubRelease[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GitHubReleases({ releases, isLoading, isError, onRetry }: GitHubReleasesProps) {
  if (isLoading || !releases) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Releases
          </h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-danger-400 mb-2" />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Failed to load releases
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium transition-all hover-bg"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            )}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (releases.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Releases
          </h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 mb-2" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No releases found
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
          Releases
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Latest {releases.length} releases
        </p>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
          {releases.map((release) => (
            <div key={release.tag_name} className="px-4 py-3 transition-colors hover-bg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {release.name || release.tag_name}
                    </span>
                    {release.prerelease && (
                      <StatusBadge status="warning" dot={false}>Pre-release</StatusBadge>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="font-mono">{release.tag_name}</span>
                    <span>Published {formatDate(release.published_at)}</span>
                  </div>
                  {release.body && (
                    <p className="mt-1.5 text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {release.body.split('\n').slice(0, 3).join('\n')}
                    </p>
                  )}
                  {release.assets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {release.assets.slice(0, 3).map((asset) => (
                        <span
                          key={asset.name}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px]"
                          style={{ borderColor: 'var(--color-border-light)' }}
                        >
                          <Download className="h-2.5 w-2.5" />
                          {asset.name} ({formatSize(asset.size)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded p-1 transition-colors hover-bg"
                >
                  <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
