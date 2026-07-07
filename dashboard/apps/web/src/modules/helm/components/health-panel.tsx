'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { HeartPulse } from 'lucide-react';
import type { HelmHealth } from '../types';

interface HealthPanelProps {
  health?: HelmHealth;
  isLoading?: boolean;
}

export function HealthPanel({ health, isLoading }: HealthPanelProps) {
  if (isLoading || !health) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Helm Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = health.helm_installed ? 'success' as const : 'danger' as const;

  const components = [
    { label: 'Helm CLI', ok: health.helm_installed, detail: health.cli_version || '—' },
    { label: 'Repositories', ok: health.repositories_ok === health.repositories_total && health.repositories_total > 0, detail: `${health.repositories_ok}/${health.repositories_total}` },
    { label: 'Releases', ok: health.releases_ok > 0 || health.releases_total === 0, detail: `${health.releases_ok}/${health.releases_total}` },
    { label: 'Charts Available', ok: health.chart_count > 0, detail: String(health.chart_count) },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Helm Health</CardTitle>
          <HeartPulse className={`h-4 w-4 ${statusColor === 'success' ? 'text-success-500' : 'text-danger-500'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <StatusBadge status={statusColor} dot>
            {health.helm_installed ? 'Installed' : 'Unavailable'}
          </StatusBadge>
          <span className="text-xs text-neutral-500">CLI: {health.cli_version || 'N/A'}</span>
        </div>
        <div className="space-y-1.5">
          {components.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
              <span className="text-neutral-700 dark:text-neutral-300">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">{c.detail}</span>
                <StatusBadge status={c.ok ? 'success' : c.label === 'Helm CLI' ? 'danger' : 'warning'} dot={false}>
                  {c.ok ? 'OK' : 'Issue'}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
