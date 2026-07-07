'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { HardDrive } from 'lucide-react';
import type { PersistentVolumeInfo } from '../types';

interface StorageTableProps {
  persistentVolumes?: PersistentVolumeInfo[];
  isLoading?: boolean;
}

export function StorageTable({ persistentVolumes, isLoading }: StorageTableProps) {
  if (isLoading || !persistentVolumes) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Persistent Volumes</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Persistent Volumes ({persistentVolumes.length})</CardTitle>
          <HardDrive className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Capacity</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Storage Class</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Access Modes</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Claim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {persistentVolumes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">No persistent volumes found</td></tr>
              ) : (
                persistentVolumes.map((pv) => (
                  <tr key={pv.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">{pv.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={pv.status === 'Bound' ? 'success' : pv.status === 'Available' ? 'info' : 'warning'} dot>
                        {pv.status}
                      </StatusBadge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{pv.capacity || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{pv.storage_class || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 lg:table-cell">{pv.access_modes.join(', ') || '—'}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-400 lg:table-cell">{pv.claim || '—'}</td>
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
