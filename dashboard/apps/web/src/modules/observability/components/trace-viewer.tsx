'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Search } from '@aegisai/ui';
import { ListMusic } from 'lucide-react';
import { useState } from 'react';
import { useTempoTraces, useTempoServices } from '../hooks/use-observability';

export function TraceViewer() {
  const [service, setService] = useState('');
  const { data: traces, isLoading } = useTempoTraces(service);
  const { data: services } = useTempoServices();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListMusic className="h-4 w-4 text-primary-500" />
          <CardTitle className="text-base font-semibold">Trace Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Search
            placeholder="Filter by trace ID..."
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        {services && services.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {services.map((s) => (
              <button
                key={s.name}
                onClick={() => setService(s.name)}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  service === s.name
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
            </div>
          ) : traces && traces.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-neutral-500">
                  <th className="pb-2 font-medium">Trace ID</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium">Spans</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 font-mono text-neutral-900 dark:text-neutral-100">
                      {t.trace_id.slice(0, 16)}...
                    </td>
                    <td className="py-1.5 text-neutral-700 dark:text-neutral-300">
                      {(t.duration_ms / 1000).toFixed(2)}s
                    </td>
                    <td className="py-1.5 text-neutral-600 dark:text-neutral-400">{t.service_name}</td>
                    <td className="py-1.5 text-neutral-600 dark:text-neutral-400">{t.span_count}</td>
                    <td className="py-1.5">
                      <StatusBadge status={t.status === 'ok' ? 'success' : 'danger'} dot>
                        {t.status === 'ok' ? 'OK' : 'Error'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-xs text-neutral-500">No traces found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
