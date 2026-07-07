'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Wrench } from 'lucide-react';
import type { ToolInfo } from '../types';

interface InstalledToolsTableProps {
  tools?: ToolInfo[];
  isLoading?: boolean;
}

export function InstalledToolsTable({ tools, isLoading }: InstalledToolsTableProps) {
  if (isLoading || !tools) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Installed Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
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
          <CardTitle className="text-base font-semibold">Installed Tools</CardTitle>
          <Wrench className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Tool</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Version</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Latest</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tools.map((tool) => (
                <tr key={tool.name} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">
                    {tool.name}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      status={tool.installed ? 'success' : 'danger'}
                      dot
                    >
                      {tool.installed ? 'Installed' : 'Missing'}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {tool.version || '—'}
                  </td>
                  <td className="hidden px-4 py-2.5 font-mono text-xs text-neutral-400 md:table-cell">
                    {tool.latest_version || '—'}
                  </td>
                  <td className="hidden max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-neutral-400 lg:table-cell">
                    {tool.path || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
