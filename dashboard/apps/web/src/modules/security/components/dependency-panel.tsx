'use client';

import { Card, StatusBadge } from '@aegisai/ui';
import { Shield } from 'lucide-react';
import type { DependencyAuditResult } from '../types';

interface Props {
  result?: DependencyAuditResult;
  isLoading?: boolean;
}

export function DependencyPanel({ result, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <div className="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          <h3 className="text-sm font-semibold">Dependency Audit</h3>
        </div>
        <p className="text-sm text-neutral-500">No dependency data available. Run a dependency audit to check for vulnerable packages.</p>
      </Card>
    );
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger' as const;
      case 'high': return 'danger' as const;
      case 'medium': return 'warning' as const;
      case 'low': return 'neutral' as const;
      default: return 'neutral' as const;
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-sm font-semibold">Dependency Audit</h3>
        <span className="ml-auto text-xs text-neutral-500">{result.total_packages} packages, {result.vulnerable_count} vulnerable</span>
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {result.vulnerabilities.map((vuln, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-neutral-50 p-2 text-xs dark:bg-neutral-800/50">
            <StatusBadge status={severityColor(vuln.severity)} className="shrink-0 mt-0.5">{vuln.severity}</StatusBadge>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">{vuln.package} {vuln.installed_version}</p>
              <p className="truncate text-neutral-500">{vuln.advisory}</p>
              {vuln.cve && <p className="text-xs text-neutral-400">{vuln.cve}</p>}
            </div>
          </div>
        ))}
        {result.vulnerabilities.length === 0 && (
          <p className="text-sm text-green-600 dark:text-green-400">No known vulnerabilities found.</p>
        )}
      </div>
    </Card>
  );
}
