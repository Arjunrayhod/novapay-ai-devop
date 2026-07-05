'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { List } from 'lucide-react';
import type { EventInfo } from '../types';

interface EventsPanelProps {
  events?: EventInfo[];
  isLoading?: boolean;
}

type EventFilter = 'all' | 'normal' | 'warning';

export function EventsPanel({ events, isLoading }: EventsPanelProps) {
  const [filter, setFilter] = useState<EventFilter>('all');

  const filtered = useMemo(() => {
    if (!events) return [];
    if (filter === 'all') return events;
    return events.filter((e) => e.type.toLowerCase() === filter);
  }, [events, filter]);

  const filters: { label: string; value: EventFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Normal', value: 'normal' },
    { label: 'Warning', value: 'warning' },
  ];

  if (isLoading || !events) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Events ({events.length})</CardTitle>
          <List className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >{f.label}</button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto p-0">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-8 text-sm text-neutral-400">No events found</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((ev, i) => (
              <div key={`${ev.name}-${i}`} className="flex items-start gap-3 px-4 py-2 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <StatusBadge status={ev.type === 'Warning' ? 'danger' : 'info'} dot>
                  {ev.type}
                </StatusBadge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{ev.reason}</span>
                    <span className="text-neutral-400">{ev.involved_object.kind}/{ev.involved_object.name}</span>
                  </div>
                  <p className="mt-0.5 truncate text-neutral-500">{ev.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-neutral-400">
                  <span>{ev.age}</span>
                  <span className="text-[10px]">{ev.count}x</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
