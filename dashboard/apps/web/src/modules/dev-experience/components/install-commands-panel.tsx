'use client';

import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { Terminal, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { InstallCommand } from '../types';

interface InstallCommandsPanelProps {
  commands?: InstallCommand[];
  missingTools?: string[];
  isLoading?: boolean;
}

export function InstallCommandsPanel({ commands, missingTools, isLoading }: InstallCommandsPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback(async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // silently fail
    }
  }, []);

  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (!commands || commands.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-success-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Install Commands
            </h3>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm text-neutral-500">All tools are installed. No install commands needed.</p>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Quick Install
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          {missingTools?.length} tool{missingTools?.length !== 1 ? 's' : ''} missing — click to copy commands
        </p>
      </GlassCardHeader>
      <GlassCardContent className="space-y-2">
        {commands.map((cmd, index) => (
          <div key={cmd.tool_name} className="group rounded-lg border border-border bg-neutral-50 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/50">
            <div className="flex items-center justify-between px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{cmd.tool_name}</span>
                <StatusBadge status="info" dot={false}>{cmd.provider}</StatusBadge>
              </div>
              <button
                onClick={() => handleCopy(cmd.command, index)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-400 opacity-0 transition-all hover:text-primary-500 group-hover:opacity-100"
                title="Copy command"
              >
                {copiedIndex === index ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedIndex === index ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="border-t border-border px-3 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
              {cmd.command}
            </div>
          </div>
        ))}
      </GlassCardContent>
    </GlassCard>
  );
}
