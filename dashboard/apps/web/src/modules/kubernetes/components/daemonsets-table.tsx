'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Layers } from 'lucide-react';
import type { DaemonSetInfo } from '../types';

interface DaemonSetsTableProps {
  daemonsets?: DaemonSetInfo[];
  isLoading?: boolean;
}

export function DaemonSetsTable({ daemonsets, isLoading }: DaemonSetsTableProps) {
  if (isLoading || !daemonsets) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">DaemonSets</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">DaemonSets ({daemonsets.length})</CardTitle>
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
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Desired</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Current</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Ready</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Available</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {daemonsets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">No DaemonSets found</td></tr>
              ) : (
                daemonsets.map((ds) => (
                  <tr key={`${ds.namespace}-${ds.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{ds.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{ds.name}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{ds.desired_scheduled}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{ds.current_scheduled}</td>
                    <td className="hidden px-4 py-2.5 text-xs md:table-cell">
                      <StatusBadge status={ds.ready === ds.desired_scheduled && ds.desired_scheduled > 0 ? 'success' : 'warning'} dot={false}>
                        {ds.ready}/{ds.desired_scheduled}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{ds.available}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{ds.age}</td>
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
