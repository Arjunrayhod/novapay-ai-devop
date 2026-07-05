'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { HardDrive } from 'lucide-react';
import type { VolumeInfo } from '../types';

interface VolumesTableProps {
  volumes?: VolumeInfo[];
  isLoading?: boolean;
}

export function VolumesTable({ volumes, isLoading }: VolumesTableProps) {
  if (isLoading || !volumes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Volumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
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
          <CardTitle className="text-base font-semibold">Volumes</CardTitle>
          <HardDrive className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Driver</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Mount Point</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {volumes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No volumes found
                  </td>
                </tr>
              ) : (
                volumes.map((v) => (
                  <tr key={v.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">
                      {v.name}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{v.driver}</td>
                    <td className="hidden max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-neutral-500 md:table-cell">
                      {v.mount_point}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">
                      {v.size || '—'}
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
