'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Package } from 'lucide-react';
import type { TerraformResource } from '../types';

interface ResourcesTableProps {
  resources?: TerraformResource[];
  isLoading?: boolean;
}

type FilterState = 'all' | 'managed' | 'data';

export function ResourcesTable({ resources, isLoading }: ResourcesTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const filtered = useMemo(() => {
    if (!resources) return [];
    return resources.filter((r) => {
      if (filter === 'managed' && r.mode !== 'managed') return false;
      if (filter === 'data' && r.mode !== 'data') return false;
      if (search && !r.address.toLowerCase().includes(search.toLowerCase()) && !r.type.toLowerCase().includes(search.toLowerCase()) && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [resources, search, filter]);

  if (isLoading || !resources) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Resources</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filters: { label: string; value: FilterState }[] = [
    { label: 'All', value: 'all' },
    { label: 'Managed', value: 'managed' },
    { label: 'Data', value: 'data' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Resources ({resources.length})</CardTitle>
          <Package className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >{f.label}</button>
            ))}
          </div>
          <Search placeholder="Search resources..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Module</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Provider</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No resources match your search' : 'No resources found'}</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.address} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{r.type}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{r.name}</td>
                    <td className="hidden max-w-xs truncate px-4 py-2.5 font-mono text-[11px] text-neutral-500 md:table-cell">{r.module || 'root'}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-[11px] text-neutral-500 md:table-cell">{r.provider}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.mode === 'managed' ? 'success' : 'info'} dot={false}>{r.mode}</StatusBadge>
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
