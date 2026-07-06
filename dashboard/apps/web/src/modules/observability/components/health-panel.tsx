'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { HeartPulse } from 'lucide-react';
import type { ObservabilityHealth } from '../types';

interface HealthPanelProps {
  health?: ObservabilityHealth;
  isLoading?: boolean;
}

export function HealthPanel({ health, isLoading }: HealthPanelProps) {
  if (isLoading || !health) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">System Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allHealthy = health.prometheus === 'healthy' && health.grafana === 'healthy';
  const statusColor = allHealthy ? ('success' as const) : ('danger' as const);

  const components = [
    { label: 'Prometheus', status: health.prometheus },
    { label: 'Grafana', status: health.grafana },
    { label: 'Loki', status: health.loki },
    { label: 'Tempo', status: health.tempo },
    { label: 'OpenTelemetry', status: health.otel },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">System Health</CardTitle>
          <HeartPulse className={`h-4 w-4 ${statusColor === 'success' ? 'text-success-500' : 'text-danger-500'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <StatusBadge status={statusColor} dot>
            {allHealthy ? 'All Healthy' : 'Degraded'}
          </StatusBadge>
        </div>
        <div className="space-y-1.5">
          {components.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
              <span className="text-neutral-700 dark:text-neutral-300">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">{c.status}</span>
                <StatusBadge status={c.status === 'healthy' ? 'success' : 'danger'} dot={false}>
                  {c.status === 'healthy' ? 'OK' : 'Down'}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
