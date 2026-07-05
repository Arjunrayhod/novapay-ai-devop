'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Layers } from 'lucide-react';
import type { StatefulSetInfo } from '../types';

interface StatefulSetsTableProps {
  statefulsets?: StatefulSetInfo[];
  isLoading?: boolean;
}

export function StatefulSetsTable({ statefulsets, isLoading }: StatefulSetsTableProps) {
  if (isLoading || !statefulsets) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">StatefulSets</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">StatefulSets ({statefulsets.length})</CardTitle>
          <Layers className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Namespace</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Replicas</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Ready</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Current</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Updated</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statefulsets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">No StatefulSets found</td></tr>
              ) : (
                statefulsets.map((s) => (
                  <tr key={`${s.namespace}-${s.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{s.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{s.name}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{s.replicas}</td>
                    <td className="hidden px-4 py-2.5 text-xs md:table-cell">
                      <StatusBadge status={s.ready_replicas === s.replicas && s.replicas > 0 ? 'success' : 'warning'} dot={false}>
                        {s.ready_replicas}/{s.replicas}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{s.current_replicas}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{s.updated_replicas}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{s.age}</td>
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
