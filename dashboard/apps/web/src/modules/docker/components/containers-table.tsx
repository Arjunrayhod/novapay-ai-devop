'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Search } from '@aegisai/ui';
import { Container } from 'lucide-react';
import type { ContainerInfo } from '../types';

interface ContainersTableProps {
  containers?: ContainerInfo[];
  isLoading?: boolean;
}

type FilterState = 'all' | 'running' | 'stopped' | 'paused' | 'restarting';

function getStateBadge(state: string) {
  switch (state) {
    case 'running': return 'success' as const;
    case 'paused': return 'warning' as const;
    case 'restarting': return 'warning' as const;
    case 'exited': return 'danger' as const;
    default: return 'neutral' as const;
  }
}

function getHealthBadge(health: string | null) {
  if (!health) return null;
  switch (health) {
    case 'healthy': return 'success' as const;
    case 'unhealthy': return 'danger' as const;
    case 'starting': return 'warning' as const;
    default: return 'neutral' as const;
  }
}

export function ContainersTable({ containers, isLoading }: ContainersTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const filtered = useMemo(() => {
    if (!containers) return [];
    return containers.filter((c) => {
      if (filter === 'running' && c.state !== 'running') return false;
      if (filter === 'stopped' && c.state !== 'exited') return false;
      if (filter === 'paused' && c.state !== 'paused') return false;
      if (filter === 'restarting' && c.state !== 'restarting') return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.image.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [containers, search, filter]);

  const filters: { label: string; value: FilterState }[] = [
    { label: 'All', value: 'all' },
    { label: 'Running', value: 'running' },
    { label: 'Stopped', value: 'stopped' },
    { label: 'Paused', value: 'paused' },
    { label: 'Restarting', value: 'restarting' },
  ];

  if (isLoading || !containers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
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
          <CardTitle className="text-base font-semibold">Containers</CardTitle>
          <Container className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Search
            placeholder="Search containers..."
            onSearch={setSearch}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Image</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Ports</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Uptime</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Restarts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">
                    {search ? 'No containers match your search' : 'No containers found'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-50">{c.name}</span>
                        {c.health && (
                          <StatusBadge status={getHealthBadge(c.health)!} dot={false}>
                            {c.health}
                          </StatusBadge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {c.image}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={getStateBadge(c.state)} dot>
                        {c.status}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 font-mono text-xs text-neutral-500 md:table-cell">
                      {c.ports}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">
                      {c.uptime}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">
                      {c.restart_count}
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
