'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { Box } from 'lucide-react';
import type { TerraformModule } from '../types';

interface ModulesTableProps {
  modules?: TerraformModule[];
  isLoading?: boolean;
}

export function ModulesTable({ modules, isLoading }: ModulesTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!modules) return [];
    return modules.filter((m) => {
      if (search && !m.address.toLowerCase().includes(search.toLowerCase()) && !m.source.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [modules, search]);

  if (isLoading || !modules) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Modules</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Modules ({modules.length})</CardTitle>
          <Box className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search modules..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Address</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Source</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Version</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">{search ? 'No modules match your search' : 'No modules found'}</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.address} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-mono text-[11px] font-medium text-neutral-900 dark:text-neutral-50">{m.address}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 font-mono text-[11px] text-neutral-500">{m.source}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{m.version || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{m.resource_count}</td>
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
