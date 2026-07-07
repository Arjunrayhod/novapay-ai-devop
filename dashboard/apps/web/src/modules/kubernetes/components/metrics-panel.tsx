'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { Activity, Cpu, MemoryStick, Wifi } from 'lucide-react';
import type { ClusterMetrics } from '../types';

interface MetricsPanelProps {
  metrics?: ClusterMetrics;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatCpu(millicores: number): string {
  if (millicores >= 1000) return `${(millicores / 1000).toFixed(2)}`;
  return `${millicores}m`;
}

export function MetricsPanel({ metrics, isLoading }: MetricsPanelProps) {
  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Cluster Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics.metrics_available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Cluster Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
            Metrics server not available. Install metrics-server for resource utilization data.
          </div>
        </CardContent>
      </Card>
    );
  }

  const cpuColor = metrics.cpu_utilization_percent > 80 ? 'text-danger-500' : metrics.cpu_utilization_percent > 50 ? 'text-warning-500' : 'text-success-500';
  const memColor = metrics.memory_utilization_percent > 80 ? 'text-danger-500' : metrics.memory_utilization_percent > 50 ? 'text-warning-500' : 'text-success-500';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Cluster Metrics</CardTitle>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
            Refreshing every 10s
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-neutral-400" />
                <span className="text-neutral-500">CPU</span>
              </div>
              <span className={cpuColor}>{metrics.cpu_utilization_percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className={`h-full rounded-full transition-all ${cpuColor.replace('text-', 'bg-')}`}
                style={{ width: `${Math.min(metrics.cpu_utilization_percent, 100)}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
              <span>Used: {formatCpu(metrics.total_node_cpu_millicores)}</span>
              <span>Total: {formatCpu(metrics.total_capacity_cpu_millicores)}</span>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <MemoryStick className="h-3 w-3 text-neutral-400" />
                <span className="text-neutral-500">Memory</span>
              </div>
              <span className={memColor}>{metrics.memory_utilization_percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className={`h-full rounded-full transition-all ${memColor.replace('text-', 'bg-')}`}
                style={{ width: `${Math.min(metrics.memory_utilization_percent, 100)}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
              <span>Used: {formatBytes(metrics.total_node_memory_bytes)}</span>
              <span>Total: {formatBytes(metrics.total_capacity_memory_bytes)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/30">
              <Activity className="h-3.5 w-3.5 text-primary-500" />
              <div>
                <p className="text-[10px] text-neutral-400">Pods</p>
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-50">{metrics.pod_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/30">
              <Wifi className="h-3.5 w-3.5 text-primary-500" />
              <div>
                <p className="text-[10px] text-neutral-400">Avg Pod CPU</p>
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-50">
                  {metrics.pod_count > 0 ? formatCpu(Math.round(metrics.total_pod_cpu_millicores / metrics.pod_count)) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
