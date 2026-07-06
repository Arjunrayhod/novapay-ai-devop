'use client';

import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { FileSearch } from 'lucide-react';
import { useState } from 'react';
import { useLokiLogs, useLokiLabels } from '../hooks/use-observability';

export function LogsViewer() {
  const [query, setQuery] = useState('{job=~".+"}');
  const [limit] = useState(50);
  const { data: logs, isLoading } = useLokiLogs(query, limit);
  const { data: labels } = useLokiLabels();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-primary-500" />
          <CardTitle className="text-base font-semibold">Live Logs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Search
            placeholder='LogQL query (e.g. {job=~".+"})'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {labels && labels.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {labels.slice(0, 10).map((l) => (
              <button
                key={l.name}
                onClick={() => setQuery(`{${l.name}=~".+"}`)}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="rounded bg-neutral-50 px-2 py-1 font-mono text-xs dark:bg-neutral-800/30">
                  <span className="text-neutral-400">{log.timestamp}</span>{' '}
                  <span className="text-neutral-900 dark:text-neutral-100">{log.line}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-neutral-500">No log entries found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
