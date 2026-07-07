'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { HeartPulse } from 'lucide-react';
import type { ClusterHealth } from '../types';

interface HealthPanelProps {
  health?: ClusterHealth;
  isLoading?: boolean;
}

export function HealthPanel({ health, isLoading }: HealthPanelProps) {
  if (isLoading || !health) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Cluster Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthColor = health.status === 'healthy' ? 'success' as const : health.status === 'degraded' ? 'warning' as const : 'danger' as const;

  const components = [
    { label: 'API Server', ok: health.components?.api_server ?? false },
    { label: 'Nodes Ready', ok: health.components?.nodes ?? false },
    { label: 'CoreDNS', ok: health.components?.core_dns ?? false },
    { label: 'Metrics Server', ok: health.components?.metrics_server ?? false },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Cluster Health</CardTitle>
          <HeartPulse className={`h-4 w-4 ${healthColor === 'success' ? 'text-success-500' : healthColor === 'warning' ? 'text-warning-500' : 'text-danger-500'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <StatusBadge status={healthColor} dot>
            {health.status}
          </StatusBadge>
          <span className="text-xs text-neutral-500">{health.health_percent}% · {health.version}</span>
        </div>
        <div className="space-y-1.5">
          {components.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
              <span className="text-neutral-700 dark:text-neutral-300">{c.label}</span>
              <StatusBadge status={c.ok ? 'success' : 'danger'} dot={false}>
                {c.ok ? 'Ready' : 'Down'}
              </StatusBadge>
            </div>
          ))}
        </div>
        {health.storage_classes && health.storage_classes.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400">Storage Classes</p>
            <div className="flex flex-wrap gap-1">
              {health.storage_classes.map((sc) => (
                <span key={sc} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{sc}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
