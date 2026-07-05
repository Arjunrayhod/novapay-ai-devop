'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { List } from 'lucide-react';
import type { DockerEvent } from '../types';

interface DockerEventStreamProps {
  events: DockerEvent[];
}

function getEventColor(action: string) {
  if (action.includes('start') || action.includes('create')) return 'success' as const;
  if (action.includes('stop') || action.includes('die') || action.includes('kill')) return 'danger' as const;
  if (action.includes('pause')) return 'warning' as const;
  if (action.includes('pull') || action.includes('import')) return 'info' as const;
  return 'neutral' as const;
}

function formatTime(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString();
  } catch {
    return '—';
  }
}

export function DockerEventStream({ events }: DockerEventStreamProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Event Stream</CardTitle>
          <List className="h-4 w-4 text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto p-0">
        {events.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-8 text-sm text-neutral-400">
            No recent events. Events will appear here as they occur.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((evt, i) => (
              <div key={`${evt.actor_id}-${i}`} className="flex items-start gap-3 px-4 py-2.5 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <StatusBadge status={getEventColor(evt.action)} dot>
                  {evt.action}
                </StatusBadge>
                <div className="flex-1 min-w-0">
                  <span className="text-neutral-800 dark:text-neutral-200">{evt.actor_name}</span>
                  <span className="text-neutral-400"> ({evt.type})</span>
                </div>
                <span className="shrink-0 text-neutral-400">{formatTime(evt.time)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
