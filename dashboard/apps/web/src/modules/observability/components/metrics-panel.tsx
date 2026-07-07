'use client';

import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { usePrometheusMetrics } from '../hooks/use-observability';

export function MetricsPanel() {
  const [query, setQuery] = useState('');
  const { data: metrics, isLoading } = usePrometheusMetrics(query);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            <CardTitle className="text-base font-semibold">Live Metrics</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Search
            placeholder="Search metrics (e.g. go_memstats)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        ) : metrics && metrics.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-neutral-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Labels</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 font-mono text-neutral-900 dark:text-neutral-100">{m.name}</td>
                    <td className="py-1.5 text-neutral-700 dark:text-neutral-300">{m.value}</td>
                    <td className="py-1.5 text-neutral-500">{Object.keys(m.labels).length} labels</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xs text-neutral-500">No metrics found. Try a different query.</p>
        )}
      </CardContent>
    </Card>
  );
}
