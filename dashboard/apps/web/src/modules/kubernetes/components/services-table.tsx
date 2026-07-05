'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Globe } from 'lucide-react';
import type { ServiceInfo } from '../types';

interface ServicesTableProps {
  services?: ServiceInfo[];
  isLoading?: boolean;
}

export function ServicesTable({ services, isLoading }: ServicesTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!services) return [];
    if (!search) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.namespace.toLowerCase().includes(search.toLowerCase()),
    );
  }, [services, search]);

  if (isLoading || !services) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Services</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Services ({services.length})</CardTitle>
          <Globe className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search services..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Namespace</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Type</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Cluster IP</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Ports</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">External IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No services match your search' : 'No services found'}</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={`${s.namespace}-${s.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{s.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{s.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={s.type === 'ClusterIP' ? 'neutral' : s.type === 'NodePort' ? 'info' : 'success'} dot={false}>
                        {s.type}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 font-mono text-xs text-neutral-500 md:table-cell">{s.cluster_ip}</td>
                    <td className="hidden max-w-[200px] truncate px-4 py-2.5 font-mono text-[10px] text-neutral-400 lg:table-cell">{s.ports.join(', ')}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-xs text-neutral-500 lg:table-cell">{s.external_ip[0] || '—'}</td>
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
