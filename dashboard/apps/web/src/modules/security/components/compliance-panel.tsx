'use client';

import { Card, StatusBadge } from '@aegisai/ui';
import { Lock } from 'lucide-react';
import type { ComplianceReport } from '../types';

interface Props {
  report?: ComplianceReport;
  isLoading?: boolean;
}

export function CompliancePanel({ report, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <div className="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          <h3 className="text-sm font-semibold">Compliance</h3>
        </div>
        <p className="text-sm text-neutral-500">No compliance data available.</p>
      </Card>
    );
  }

  const statusColor = (status: string) => {
    if (status === 'available' || status === 'passed') return 'success' as const;
    if (status === 'no-policies') return 'warning' as const;
    return 'danger' as const;
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-sm font-semibold">Compliance</h3>
        <span className="ml-auto text-sm font-medium">{report.overall_score}%</span>
      </div>
      <div className="mb-4 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-2 rounded-full bg-accent-500 transition-all"
          style={{ width: `${Math.min(report.overall_score, 100)}%` }}
        />
      </div>
      <div className="space-y-2">
        {report.checks.map((check, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">{check.framework}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{check.score}%</span>
              <StatusBadge status={statusColor(check.status)}>{check.status}</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
