'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Server } from 'lucide-react';
import type { HelmRepository } from '../types';

interface RepositoriesTableProps {
  repositories?: HelmRepository[];
  isLoading?: boolean;
}

export function RepositoriesTable({ repositories, isLoading }: RepositoriesTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!repositories) return [];
    return repositories.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.url.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [repositories, search]);

  if (isLoading || !repositories) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Repositories</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Repositories ({repositories.length})</CardTitle>
          <Server className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search repositories..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">URL</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No repositories match your search' : 'No repositories found'}</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{r.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{r.url}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status === 'ok' ? 'success' : 'danger'} dot>{r.status}</StatusBadge>
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
