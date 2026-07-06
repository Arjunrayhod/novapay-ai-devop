'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Container } from 'lucide-react';
import type { HelmRelease } from '../types';

interface ReleasesTableProps {
  releases?: HelmRelease[];
  isLoading?: boolean;
}

type FilterState = 'all' | 'deployed' | 'failed' | 'pending' | 'superseded' | 'uninstalled';

function getStatusBadge(status: string) {
  if (status === 'deployed') return 'success' as const;
  if (status === 'failed') return 'danger' as const;
  if (status === 'pending-install' || status === 'pending-upgrade' || status === 'pending-rollback') return 'warning' as const;
  if (status === 'superseded') return 'info' as const;
  if (status === 'uninstalled') return 'neutral' as const;
  return 'neutral' as const;
}

export function ReleasesTable({ releases, isLoading }: ReleasesTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const filtered = useMemo(() => {
    if (!releases) return [];
    return releases.filter((r) => {
      if (filter === 'deployed' && r.status !== 'deployed') return false;
      if (filter === 'failed' && r.status !== 'failed') return false;
      if (filter === 'pending' && !r.status.startsWith('pending-')) return false;
      if (filter === 'superseded' && r.status !== 'superseded') return false;
      if (filter === 'uninstalled' && r.status !== 'uninstalled') return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.namespace.toLowerCase().includes(search.toLowerCase()) && !r.chart.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [releases, search, filter]);

  const filters: { label: string; value: FilterState }[] = [
    { label: 'All', value: 'all' },
    { label: 'Deployed', value: 'deployed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Superseded', value: 'superseded' },
    { label: 'Uninstalled', value: 'uninstalled' },
  ];

  if (isLoading || !releases) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Releases</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Releases ({releases.length})</CardTitle>
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
          <Search placeholder="Search releases..." onSearch={setSearch} className="max-w-xs" />
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
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Revision</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Chart</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">App Version</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No releases match your search' : 'No releases found'}</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={`${r.namespace}-${r.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{r.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{r.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={getStatusBadge(r.status)} dot>{r.status}</StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">v{r.revision}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-[11px] text-neutral-500 md:table-cell">{r.chart}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{r.app_version || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 lg:table-cell">{r.updated}</td>
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
