'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { Network } from 'lucide-react';
import type { NetworkInfo } from '../types';

interface NetworksTableProps {
  networks?: NetworkInfo[];
  isLoading?: boolean;
}

export function NetworksTable({ networks, isLoading }: NetworksTableProps) {
  if (isLoading || !networks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Networks</CardTitle>
          <Network className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Driver</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Scope</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Subnet</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-500">Containers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {networks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No networks found
                  </td>
                </tr>
              ) : (
                networks.map((n) => (
                  <tr key={n.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">
                      {n.name}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{n.driver}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{n.scope}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-xs text-neutral-400 lg:table-cell">
                      {n.subnet || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-neutral-500">
                      {n.attached_containers}
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
