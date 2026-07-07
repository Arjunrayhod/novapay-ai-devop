'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Layers } from 'lucide-react';
import type { DeploymentInfo } from '../types';

interface DeploymentsTableProps {
  deployments?: DeploymentInfo[];
  isLoading?: boolean;
}

export function DeploymentsTable({ deployments, isLoading }: DeploymentsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!deployments) return [];
    if (!search) return deployments;
    return deployments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.namespace.toLowerCase().includes(search.toLowerCase()),
    );
  }, [deployments, search]);

  if (isLoading || !deployments) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Deployments</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Deployments ({deployments.length})</CardTitle>
          <Layers className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search deployments..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Namespace</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Strategy</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Desired</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Ready</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Available</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No deployments match your search' : 'No deployments found'}</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr key={`${d.namespace}-${d.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{d.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{d.name}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{d.strategy}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{d.replicas}</td>
                    <td className="hidden px-4 py-2.5 text-xs md:table-cell">
                      <StatusBadge status={d.ready_replicas === d.replicas && d.replicas > 0 ? 'success' : 'warning'} dot={false}>
                        {d.ready_replicas}/{d.replicas}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{d.available_replicas}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{d.age}</td>
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
