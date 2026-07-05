'use client';

import { Card, StatusBadge } from '@aegisai/ui';
import { FileSearch } from 'lucide-react';
import type { SastScanResult } from '../types';

interface Props {
  result?: SastScanResult;
  isLoading?: boolean;
}

export function SastPanel({ result, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <div className="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileSearch className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          <h3 className="text-sm font-semibold">SAST Scan</h3>
        </div>
        <p className="text-sm text-neutral-500">No scan data available. Run a SAST scan to detect code issues.</p>
      </Card>
    );
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'danger' as const;
      case 'medium': return 'warning' as const;
      case 'low': return 'neutral' as const;
      default: return 'neutral' as const;
    }
  };

  const highCount = result.issues.filter(i => i.severity === 'high').length;
  const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
  const lowCount = result.issues.filter(i => i.severity === 'low').length;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <FileSearch className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-sm font-semibold">SAST Scan</h3>
        <span className="ml-auto text-xs text-neutral-500">{result.tool} | {result.files_scanned} files | {result.scan_time_ms}ms</span>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="rounded-lg bg-red-50 px-3 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">{highCount} High</div>
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">{mediumCount} Medium</div>
        <div className="rounded-lg bg-neutral-50 px-3 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">{lowCount} Low</div>
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {result.issues.slice(0, 20).map((issue, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-neutral-50 p-2 text-xs dark:bg-neutral-800/50">
            <StatusBadge status={severityColor(issue.severity)} className="shrink-0 mt-0.5">{issue.severity}</StatusBadge>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">{issue.message}</p>
              <p className="truncate text-neutral-500">{issue.file}:{issue.line}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
