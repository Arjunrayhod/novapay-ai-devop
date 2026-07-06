'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import type { PathValidationResult } from '../types';

interface PathValidationPanelProps {
  result?: PathValidationResult;
  isLoading?: boolean;
}

const statusConfig: Record<string, { badge: 'success' | 'danger' | 'warning'; label: string }> = {
  valid: { badge: 'success', label: 'Valid' },
  missing: { badge: 'danger', label: 'Missing' },
  duplicate: { badge: 'warning', label: 'Duplicate' },
  inaccessible: { badge: 'warning', label: 'Inaccessible' },
};

export function PathValidationPanel({ result, isLoading }: PathValidationPanelProps) {
  if (isLoading || !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">PATH Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { entries, summary } = result;
  const hasIssues = summary.missing > 0 || summary.duplicate > 0 || summary.inaccessible > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">PATH Validation</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-success-500">{summary.valid} valid</span>
            {summary.missing > 0 && <span className="text-danger-500">{summary.missing} missing</span>}
            {summary.duplicate > 0 && <span className="text-warning-500">{summary.duplicate} dup</span>}
            {summary.inaccessible > 0 && <span className="text-warning-500">{summary.inaccessible} denied</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky top-0 bg-white px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:bg-neutral-950">Directory</th>
                <th className="sticky top-0 bg-white px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:bg-neutral-950">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry, idx) => {
                const config = statusConfig[entry.status] ?? { badge: 'neutral' as const, label: entry.status };
                return (
                  <tr key={idx} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="max-w-[300px] truncate px-4 py-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                      {entry.directory}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={config.badge} dot>
                        {config.label}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {hasIssues && (
          <div className="border-t border-border px-4 py-2">
            <p className="text-xs text-neutral-500">
              {summary.missing > 0 && `${summary.missing} director${summary.missing > 1 ? 'ies' : 'y'} don't exist. `}
              {summary.duplicate > 0 && `${summary.duplicate} duplicate entr${summary.duplicate > 1 ? 'ies' : 'y'}. `}
              {summary.inaccessible > 0 && `${summary.inaccessible} inaccessib${summary.inaccessible > 1 ? 'le' : 'l'} entr${summary.inaccessible > 1 ? 'ies' : 'y'}.`}
              Review your PATH environment variable.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
