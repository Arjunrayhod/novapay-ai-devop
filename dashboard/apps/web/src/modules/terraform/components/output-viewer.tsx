'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { FileJson } from 'lucide-react';
import type { TerraformOutput } from '../types';

interface OutputViewerProps {
  outputs?: TerraformOutput[];
  isLoading?: boolean;
}

export function OutputViewer({ outputs, isLoading }: OutputViewerProps) {
  if (isLoading || !outputs) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Outputs</CardTitle></CardHeader>
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
          <CardTitle className="text-base font-semibold">Outputs ({outputs.length})</CardTitle>
          <FileJson className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Sensitive</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {outputs.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-400">No outputs defined</td></tr>
              ) : (
                outputs.map((o) => (
                  <tr key={o.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-mono text-[11px] font-medium text-neutral-900 dark:text-neutral-50">{o.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{o.type}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={o.sensitive ? 'warning' : 'success'} dot={false}>
                        {o.sensitive ? 'Yes' : 'No'}
                      </StatusBadge>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2.5 font-mono text-[11px] text-neutral-500">
                      {o.sensitive ? '********' : o.value}
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
