'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Server } from 'lucide-react';
import { usePrometheusTargets } from '../hooks/use-observability';

export function TargetHealthPanel() {
  const { data: targets, isLoading } = usePrometheusTargets();

  if (isLoading || !targets) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Target Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthy = targets.filter((t) => t.health === 'up').length;
  const down = targets.filter((t) => t.health === 'down').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary-500" />
            <CardTitle className="text-base font-semibold">Target Health</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-success-500">{healthy} up</span>
            {down > 0 && <span className="text-danger-500">{down} down</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {targets.length === 0 ? (
          <p className="text-center text-xs text-neutral-500">No targets found.</p>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {targets.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
                <div>
                  <span className="text-neutral-900 dark:text-neutral-100">{t.job}</span>
                  <span className="ml-2 text-neutral-400">{t.instance}</span>
                </div>
                <StatusBadge status={t.health === 'up' ? 'success' : 'danger'} dot>
                  {t.health}
                </StatusBadge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
