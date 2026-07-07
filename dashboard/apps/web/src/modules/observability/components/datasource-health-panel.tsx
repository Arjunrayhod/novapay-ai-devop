'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { Database } from 'lucide-react';
import { useGrafanaDatasources } from '../hooks/use-observability';

export function DatasourceHealthPanel() {
  const { data: datasources, isLoading } = useGrafanaDatasources();

  if (isLoading || !datasources) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Datasource Health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary-500" />
          <CardTitle className="text-base font-semibold">Datasource Health</CardTitle>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {datasources.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {datasources.length === 0 ? (
          <p className="text-center text-xs text-neutral-500">No datasources found.</p>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {datasources.map((ds, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
                <div>
                  <span className="text-neutral-900 dark:text-neutral-100">{ds.name}</span>
                  <span className="ml-2 text-neutral-400">{ds.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">{ds.url || '—'}</span>
                  <StatusBadge status={ds.is_default ? 'success' : 'neutral'} dot={false}>
                    {ds.is_default ? 'Default' : '—'}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
