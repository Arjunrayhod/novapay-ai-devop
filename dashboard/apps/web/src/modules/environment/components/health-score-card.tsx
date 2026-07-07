'use client';

import { Card, CardContent } from '@aegisai/ui';
import { HeartPulse, Server, Code, Cloud, Eye } from 'lucide-react';
import type { HealthScore } from '../types';

interface HealthScoreCardProps {
  health?: HealthScore;
  isLoading?: boolean;
}

const breakdownConfig = [
  { key: 'infrastructure' as const, label: 'Infrastructure', icon: Server, color: 'bg-primary-500' },
  { key: 'development' as const, label: 'Development', icon: Code, color: 'bg-accent-500' },
  { key: 'cloud' as const, label: 'Cloud', icon: Cloud, color: 'bg-success-500' },
  { key: 'monitoring' as const, label: 'Monitoring', icon: Eye, color: 'bg-warning-500' },
];

export function HealthScoreCard({ health, isLoading }: HealthScoreCardProps) {
  if (isLoading || !health) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = health.overall >= 80 ? 'text-success-500' : health.overall >= 50 ? 'text-warning-500' : 'text-danger-500';
  const ringColor = health.overall >= 80 ? 'stroke-success-500' : health.overall >= 50 ? 'stroke-warning-500' : 'stroke-danger-500';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="5" className="text-neutral-200 dark:text-neutral-700" />
              <circle
                cx="36" cy="36" r="30"
                fill="none" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={2 * Math.PI * 30 * (1 - health.overall / 100)}
                strokeLinecap="round"
                className={ringColor}
              />
            </svg>
            <span className={`absolute text-lg font-bold ${scoreColor}`}>
              {health.overall}%
            </span>
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Platform Readiness
              </h3>
            </div>
            {breakdownConfig.map(({ key, label, icon: Icon, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-neutral-500">
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {health.breakdown[key]}%
                  </span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${health.breakdown[key]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
