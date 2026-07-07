'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Puzzle } from 'lucide-react';
import type { HelmDependency } from '../types';

interface DependenciesTableProps {
  dependencies?: HelmDependency[];
  isLoading?: boolean;
}

export function DependenciesTable({ dependencies, isLoading }: DependenciesTableProps) {
  if (isLoading || !dependencies) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Chart Dependencies</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Chart Dependencies ({dependencies.length})</CardTitle>
          <Puzzle className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Version</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Repository</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Condition</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dependencies.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">No dependencies defined</td></tr>
              ) : (
                dependencies.map((d) => (
                  <tr key={d.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{d.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{d.version}</td>
                    <td className="hidden max-w-xs truncate px-4 py-2.5 font-mono text-[11px] text-neutral-500 md:table-cell">{d.repository || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{d.condition || '—'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={d.enabled ? 'success' : 'neutral'} dot={false}>
                        {d.enabled ? 'Enabled' : 'Disabled'}
                      </StatusBadge>
                    </td>
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
