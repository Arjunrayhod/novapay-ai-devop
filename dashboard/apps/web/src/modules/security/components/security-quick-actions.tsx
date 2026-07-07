'use client';

import { Card } from '@aegisai/ui';
import { RefreshCw, Search, Shield } from 'lucide-react';

interface Props {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SecurityQuickActions({ onRefresh, isRefreshing }: Props) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-sm font-semibold">Quick Actions</h3>
      </div>
      <div className="space-y-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
        <button className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
          <Search className="h-4 w-4" />
          Run SAST Scan
        </button>
      </div>
    </Card>
  );
}
