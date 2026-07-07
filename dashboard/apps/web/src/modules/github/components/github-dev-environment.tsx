'use client';

import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { Wrench, CheckCircle, XCircle } from 'lucide-react';
import type { DevTool } from '../types';

interface GitHubDevEnvironmentProps {
  tools?: DevTool[];
  isLoading?: boolean;
}

export function GitHubDevEnvironment({ tools, isLoading }: GitHubDevEnvironmentProps) {
  if (isLoading || !tools) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-44 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Development Environment
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Detected tools and runtimes
        </p>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover-bg"
            >
              <div className="shrink-0">
                {tool.installed ? (
                  <CheckCircle className="h-4 w-4 text-success-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-danger-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {tool.name}
                  </span>
                  <StatusBadge status={tool.installed ? 'success' : 'danger'} dot={false}>
                    {tool.installed ? 'Installed' : 'Missing'}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {tool.version && <span className="font-mono">v{tool.version}</span>}
                  <span className={tool.path ? 'text-success-400' : 'text-danger-400'}>
                    {tool.path ? 'In PATH' : 'Not in PATH'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
