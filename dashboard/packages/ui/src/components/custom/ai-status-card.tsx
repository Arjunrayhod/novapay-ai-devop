'use client';

import { Bot, Sparkles, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIStatusCardProps {
  className?: string;
}

const capabilities = [
  { label: 'Anomaly Detection', status: 'active' as const },
  { label: 'Cost Optimization', status: 'active' as const },
  { label: 'Security Scanning', status: 'active' as const },
  { label: 'Deployment Analysis', status: 'idle' as const },
];

export function AIStatusCard({ className }: AIStatusCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface p-5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 shadow-glow-primary">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">AI Assistant</h3>
            <p className="text-xs text-neutral-500">Always active</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Online
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent-50/50 px-3 py-2 text-xs text-accent-700 dark:bg-accent-900/10 dark:text-accent-400">
        <Sparkles className="h-3 w-3 shrink-0" />
        <span>All systems nominal. No incidents detected.</span>
      </div>

      <div className="mt-3 space-y-1">
        {capabilities.map((cap) => (
          <div key={cap.label} className="flex items-center gap-2 text-xs">
            <Activity className={cn(
              'h-3 w-3',
              cap.status === 'active' ? 'text-success-500' : 'text-neutral-300 dark:text-neutral-600',
            )} />
            <span className={cn(
              'flex-1',
              cap.status === 'active' ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500',
            )}>
              {cap.label}
            </span>
            <span className={cn(
              'text-[10px]',
              cap.status === 'active' ? 'text-success-500' : 'text-neutral-400',
            )}>
              {cap.status === 'active' ? 'Active' : 'Standby'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
