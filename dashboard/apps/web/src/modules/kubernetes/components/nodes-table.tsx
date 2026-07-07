'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Server } from 'lucide-react';
import type { NodeInfo } from '../types';

interface NodesTableProps {
  nodes?: NodeInfo[];
  isLoading?: boolean;
}

type FilterState = 'all' | 'ready' | 'notready';

function formatCpu(cpu: number): string {
  if (cpu >= 1000) return `${(cpu / 1000).toFixed(1)}`;
  return `${cpu}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function NodesTable({ nodes, isLoading }: NodesTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterState>('all');

  const filtered = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter((n) => {
      if (filter === 'ready' && n.status !== 'Ready') return false;
      if (filter === 'notready' && n.status !== 'NotReady') return false;
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [nodes, search, filter]);

  const filters: { label: string; value: FilterState }[] = [
    { label: 'All', value: 'all' },
    { label: 'Ready', value: 'ready' },
    { label: 'Not Ready', value: 'notready' },
  ];

  if (isLoading || !nodes) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Nodes</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Nodes ({nodes.length})</CardTitle>
          <Server className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >{f.label}</button>
            ))}
          </div>
          <Search placeholder="Search nodes..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Role</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">CPU</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Memory</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Pods</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 xl:table-cell">Kernel</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 xl:table-cell">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No nodes match your search' : 'No nodes found'}</td></tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{n.name}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{n.roles.join(', ')}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={n.status === 'Ready' ? 'success' : 'danger'} dot>{n.status}</StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{formatCpu(n.cpu_allocatable)}/{formatCpu(n.cpu_capacity)}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{formatBytes(n.memory_allocatable)}/{formatBytes(n.memory_capacity)}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{n.pods_allocated}/{n.pods_capacity}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{n.age}</td>
                    <td className="hidden px-4 py-2.5 font-mono text-[10px] text-neutral-400 xl:table-cell">{n.kernel_version}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 xl:table-cell">{n.container_runtime}</td>
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
