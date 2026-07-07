'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { Globe } from 'lucide-react';
import type { IngressInfo } from '../types';

interface IngressTableProps {
  ingress?: IngressInfo[];
  isLoading?: boolean;
}

export function IngressTable({ ingress, isLoading }: IngressTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!ingress) return [];
    if (!search) return ingress;
    return ingress.filter((ing) =>
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.namespace.toLowerCase().includes(search.toLowerCase()),
    );
  }, [ingress, search]);

  if (isLoading || !ingress) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Ingress</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Ingress ({ingress.length})</CardTitle>
          <Globe className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search ingress..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Namespace</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Class</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Hosts</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No ingress resources match your search' : 'No ingress resources found'}</td></tr>
              ) : (
                filtered.map((ing) => (
                  <tr key={`${ing.namespace}-${ing.name}`} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{ing.namespace}</td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{ing.name}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{ing.class_name || '—'}</td>
                    <td className="hidden max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-neutral-400 lg:table-cell">
                      {ing.rules.map((r) => r.host).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{ing.age}</td>
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
