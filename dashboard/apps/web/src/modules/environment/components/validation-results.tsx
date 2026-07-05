'use client';

import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@aegisai/ui';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from 'lucide-react';
import type { ValidationResult } from '../types';

interface ValidationResultsProps {
  results?: ValidationResult[];
  isLoading?: boolean;
}

const statusConfig = {
  PASS: { badge: 'success' as const, icon: ShieldCheck, label: 'Pass' },
  WARNING: { badge: 'warning' as const, icon: ShieldAlert, label: 'Warning' },
  FAILED: { badge: 'danger' as const, icon: ShieldX, label: 'Failed' },
  SKIPPED: { badge: 'neutral' as const, icon: HelpCircle, label: 'Skipped' },
};

export function ValidationResults({ results, isLoading }: ValidationResultsProps) {
  if (isLoading || !results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Validation Results</CardTitle>
          <span className="text-xs text-neutral-400">
            {results.filter((r) => r.status === 'PASS').length}/{results.length} passed
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {results.map((result) => {
            const config = statusConfig[result.status];
            const Icon = config.icon;
            return (
              <div key={result.check} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${
                  result.status === 'PASS' ? 'text-success-500' :
                  result.status === 'WARNING' ? 'text-warning-500' :
                  result.status === 'FAILED' ? 'text-danger-500' :
                  'text-neutral-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                      {result.check}
                    </span>
                    <StatusBadge status={config.badge} dot={false}>{config.label}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {result.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
