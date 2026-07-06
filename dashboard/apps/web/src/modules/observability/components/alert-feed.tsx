'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { AlertTriangle } from 'lucide-react';
import { usePrometheusAlerts } from '../hooks/use-observability';

export function AlertFeed() {
  const { data: alerts, isLoading } = usePrometheusAlerts();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning-500" />
          <CardTitle className="text-base font-semibold">Alert Feed</CardTitle>
          {alerts && alerts.length > 0 && (
            <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-900/20 dark:text-warning-400">
              {alerts.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{alert.name}</span>
                    <StatusBadge
                      status={alert.state === 'firing' ? 'danger' : alert.state === 'pending' ? 'warning' : 'success'}
                      dot
                    >
                      {alert.state}
                    </StatusBadge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    {alert.severity && <span className="capitalize">{alert.severity}</span>}
                    {alert.active_at && <span>{new Date(alert.active_at).toLocaleString()}</span>}
                    {alert.value && <span>Value: {alert.value}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-neutral-400">
              <AlertTriangle className="h-8 w-8" />
              <p className="text-xs">No active alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
