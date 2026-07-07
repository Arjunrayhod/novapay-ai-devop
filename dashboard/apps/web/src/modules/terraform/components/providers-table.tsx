'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { Cpu } from 'lucide-react';
import type { TerraformProvider } from '../types';

interface ProvidersTableProps {
  providers?: TerraformProvider[];
  isLoading?: boolean;
}

export function ProvidersTable({ providers, isLoading }: ProvidersTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!providers) return [];
    return providers.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.source.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [providers, search]);

  if (isLoading || !providers) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Providers</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Providers ({providers.length})</CardTitle>
          <Cpu className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search providers..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Version</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No providers match your search' : 'No providers found'}</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{p.version}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 font-mono text-[11px] text-neutral-500">{p.source}</td>
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
