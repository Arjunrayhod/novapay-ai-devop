'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { History } from 'lucide-react';
import type { HelmHistory } from '../types';

interface HistoryTableProps {
  history?: HelmHistory[];
  isLoading?: boolean;
}

export function HistoryTable({ history, isLoading }: HistoryTableProps) {
  if (isLoading || !history) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Release History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Release History ({history.length})</CardTitle>
          <History className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Revision</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Description</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Chart</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">App Version</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">No history entries found</td></tr>
              ) : (
                [...history].reverse().map((h) => (
                  <tr key={h.revision} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-neutral-900 dark:text-neutral-50">v{h.revision}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={h.status === 'deployed' ? 'success' : h.status === 'failed' ? 'danger' : 'neutral'} dot>
                        {h.status}
                      </StatusBadge>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-xs text-neutral-600 dark:text-neutral-400">{h.description || '—'}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-[11px] text-neutral-500 md:table-cell">{h.chart}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{h.app_version || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 lg:table-cell">{h.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
