'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Globe } from 'lucide-react';
import type { NamespaceInfo } from '../types';

interface NamespacesTableProps {
  namespaces?: NamespaceInfo[];
  isLoading?: boolean;
}

export function NamespacesTable({ namespaces, isLoading }: NamespacesTableProps) {
  if (isLoading || !namespaces) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Namespaces</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Namespaces ({namespaces.length})</CardTitle>
          <Globe className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Labels</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Created</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {namespaces.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">No namespaces found</td></tr>
              ) : (
                namespaces.map((ns) => (
                  <tr key={ns.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{ns.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={ns.status === 'Active' ? 'success' : 'warning'} dot>{ns.status}</StatusBadge>
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-2.5 text-xs text-neutral-400 md:table-cell">
                      {Object.keys(ns.labels).length > 0 ? Object.entries(ns.labels).map(([k, v]) => `${k}=${v}`).join(', ') : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{ns.created}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{ns.age}</td>
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
