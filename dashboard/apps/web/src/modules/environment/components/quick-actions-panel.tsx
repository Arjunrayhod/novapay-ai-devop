'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, Search } from 'lucide-react';

interface QuickActionsPanelProps {
  onRefresh: () => void;
  onExport: () => void;
  onCopy: () => void;
  onScan: () => void;
  isRefreshing?: boolean;
}

export function QuickActionsPanel({ onRefresh, onExport, onCopy, onScan, isRefreshing }: QuickActionsPanelProps) {
  const actions = [
    { label: 'Run Scan', icon: Search, onClick: onScan, variant: 'primary' as const },
    { label: 'Refresh', icon: RefreshCw, onClick: onRefresh, variant: 'default' as const, spinning: isRefreshing },
    { label: 'Export Report', icon: Download, onClick: onExport, variant: 'default' as const },
    { label: 'Copy Report', icon: Copy, onClick: onCopy, variant: 'default' as const },
  ];

  return (
    <GlassCard>
      <GlassCardContent className="p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                action.variant === 'primary'
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                  : 'border border-border bg-surface text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <action.icon className={`h-3.5 w-3.5 ${action.spinning ? 'animate-spin' : ''}`} />
              {action.label}
            </button>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
