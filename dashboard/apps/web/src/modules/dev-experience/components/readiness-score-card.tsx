'use client';

import { Card, CardContent } from '@aegisai/ui';
import { HeartPulse, Wrench, AlertTriangle, FolderOpen } from 'lucide-react';
import type { ReadinessScore } from '../types';

interface ReadinessScoreCardProps {
  summary?: ReadinessScore;
  isLoading?: boolean;
}

export function ReadinessScoreCard({ summary, isLoading }: ReadinessScoreCardProps) {
  if (isLoading || !summary) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = summary.overall >= 80 ? 'text-success-500' : summary.overall >= 50 ? 'text-warning-500' : 'text-danger-500';
  const ringColor = summary.overall >= 80 ? 'stroke-success-500' : summary.overall >= 50 ? 'stroke-warning-500' : 'stroke-danger-500';

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
                strokeDashoffset={2 * Math.PI * 30 * (1 - summary.overall / 100)}
                strokeLinecap="round"
                className={ringColor}
              />
            </svg>
            <span className={`absolute text-lg font-bold ${scoreColor}`}>
              {summary.overall}%
            </span>
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Onboarding Readiness
              </h3>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  Tools
                </span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {summary.tools_installed}/{summary.total_tools}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3 w-3" />
                  Path Issues
                </span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {summary.path_issues}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Critical
                </span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {summary.critical_issues}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
