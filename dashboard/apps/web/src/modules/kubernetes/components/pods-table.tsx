'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Container } from 'lucide-react';
import type { PodInfo } from '../types';

interface PodsTableProps {
  pods?: PodInfo[];
  isLoading?: boolean;
}

type FilterState = 'all' | 'running' | 'pending' | 'failed' | 'crashloop' | 'succeeded';

function getStatusBadge(status: string, reason: string) {
  if (reason === 'CrashLoopBackOff') return 'danger' as const;
  if (status === 'Running') return 'success' as const;
  if (status === 'Pending') return 'warning' as const;
  if (status === 'Failed') return 'danger' as const;
  if (status === 'Succeeded') return 'info' as const;
  return 'neutral' as const;
}

export function PodsTable({ pods, isLoading }: PodsTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const filtered = useMemo(() => {
    if (!pods) return [];
    return pods.filter((p) => {
      if (filter === 'running' && p.status !== 'Running') return false;
      if (filter === 'pending' && p.status !== 'Pending') return false;
      if (filter === 'failed' && p.status !== 'Failed') return false;
      if (filter === 'crashloop' && p.reason !== 'CrashLoopBackOff') return false;
      if (filter === 'succeeded' && p.status !== 'Succeeded') return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.namespace.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [pods, search, filter]);

  const filters: { label: string; value: FilterState }[] = [
    { label: 'All', value: 'all' },
    { label: 'Running', value: 'running' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'CrashLoop', value: 'crashloop' },
    { label: 'Succeeded', value: 'succeeded' },
  ];

  if (isLoading || !pods) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Pods</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Pods ({pods.length})</CardTitle>
          <Container className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >{f.label}</button>
            ))}
          </div>
          <Search placeholder="Search pods..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Namespace</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Ready</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Restarts</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Node</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 xl:table-cell">Pod IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No pods match your search' : 'No pods found'}</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={`${p.namespace}-${p.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{p.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={getStatusBadge(p.status, p.reason)} dot>
                        {p.reason === 'CrashLoopBackOff' ? 'CrashLoopBackOff' : p.status}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{p.ready_containers}/{p.total_containers}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{p.restart_count}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 lg:table-cell">{p.node_name}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{p.age}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-[10px] text-neutral-400 xl:table-cell">{p.pod_ip}</td>
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
