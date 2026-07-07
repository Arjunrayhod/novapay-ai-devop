'use client';

import { Box, ArrowRightLeft, Network } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InfrastructurePlaceholderProps {
  className?: string;
}

const nodes = [
  { label: 'API', x: 50, y: 20, status: 'success' },
  { label: 'Workers', x: 20, y: 55, status: 'success' },
  { label: 'DB', x: 50, y: 55, status: 'success' },
  { label: 'Cache', x: 80, y: 55, status: 'warning' },
  { label: 'CDN', x: 80, y: 20, status: 'success' },
] as const;

export function InfrastructurePlaceholder({ className }: InfrastructurePlaceholderProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-surface p-6', className)}>
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
        <Network className="h-4 w-4" />
        <span>Infrastructure Topology</span>
      </div>

      <div className="relative h-44 w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 80" fill="none" aria-hidden="true">
          <line x1="50" y1="24" x2="20" y2="51" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" strokeWidth="0.3" />
          <line x1="50" y1="24" x2="80" y2="51" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" strokeWidth="0.3" />
          <line x1="50" y1="24" x2="80" y2="24" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" strokeWidth="0.3" />
          <line x1="20" y1="51" x2="50" y2="51" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" strokeWidth="0.3" />
          <line x1="50" y1="51" x2="80" y2="51" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" strokeWidth="0.3" />
        </svg>

        {nodes.map((node) => (
          <div
            key={node.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated shadow-sm">
              <Box className="h-3.5 w-3.5 text-neutral-500" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{node.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-neutral-50 px-3 py-2 dark:bg-neutral-900/50">
        <ArrowRightLeft className="h-3 w-3 text-neutral-400" />
        <span className="text-xs text-neutral-400">All services operational</span>
      </div>
    </div>
  );
}
