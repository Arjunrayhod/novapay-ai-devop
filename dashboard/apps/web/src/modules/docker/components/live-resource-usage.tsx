'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { Activity, Cpu, MemoryStick, Wifi } from 'lucide-react';
import type { ContainerStats } from '../types';

interface LiveResourceUsageProps {
  stats?: ContainerStats[];
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function LiveResourceUsage({ stats, isLoading }: LiveResourceUsageProps) {
  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Live Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Live Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
            No running containers to monitor
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Live Resource Usage</CardTitle>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
            Refreshing every 2s
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {stats.map((s) => (
            <div key={s.container_id} className="px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {s.container_name}
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{s.container_id}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-neutral-400" />
                  <span className="text-neutral-500">CPU:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{s.cpu_percent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MemoryStick className="h-3 w-3 text-neutral-400" />
                  <span className="text-neutral-500">Memory:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {s.memory_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-neutral-400" />
                  <span className="text-neutral-500">RX:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatBytes(s.network_rx)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-neutral-400" />
                  <span className="text-neutral-500">TX:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatBytes(s.network_tx)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
