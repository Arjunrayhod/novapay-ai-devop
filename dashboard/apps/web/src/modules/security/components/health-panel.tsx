'use client';

import { Card, StatusBadge } from '@aegisai/ui';
import { Shield } from 'lucide-react';
import type { SecurityHealth } from '../types';

interface Props {
  health?: SecurityHealth;
  isLoading?: boolean;
}

const toolLabels: Record<string, string> = {
  sast: 'SAST Scanner',
  dependency_scan: 'Dependency Scan',
  vulnerability_db: 'Vulnerability DB',
  opa: 'Open Policy Agent',
  trivy: 'Trivy',
};

export function HealthPanel({ health, isLoading }: Props) {
  if (isLoading || !health) {
    return (
      <Card>
        <div className="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </Card>
    );
  }

  const statusColor = (status: string) => {
    if (status === 'available' || status === 'available-builtin') return 'success' as const;
    return 'warning' as const;
  };

  const statusLabel = (status: string) => {
    if (status === 'available') return 'Available';
    if (status === 'available-builtin') return 'Built-in';
    return 'Unavailable';
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-sm font-semibold">Security Tool Health</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(toolLabels).map(([key, label]) => {
          const status = (health as unknown as Record<string, string>)[key] || 'unavailable';
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
              <StatusBadge status={statusColor(status)}>{statusLabel(status)}</StatusBadge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
