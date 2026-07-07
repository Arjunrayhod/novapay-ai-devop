'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import type { TerraformPlan } from '../types';

interface PlanViewerProps {
  plan?: TerraformPlan;
  isLoading?: boolean;
}

export function PlanViewer({ plan, isLoading }: PlanViewerProps) {
  if (isLoading || !plan) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan.available) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-400" />
            <CardTitle className="text-base font-semibold">Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-400">No plan available. Run terraform plan to generate one.</p>
        </CardContent>
      </Card>
    );
  }

  const changes = [
    { label: 'Add', count: plan.resources_add, icon: Plus, color: 'text-success-500', bg: 'bg-success-50/50 dark:bg-success-900/10' },
    { label: 'Change', count: plan.resources_change, icon: Pencil, color: 'text-warning-500', bg: 'bg-warning-50/50 dark:bg-warning-900/10' },
    { label: 'Destroy', count: plan.resources_destroy, icon: Trash2, color: 'text-danger-500', bg: 'bg-danger-50/50 dark:bg-danger-900/10' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-neutral-400" />
          <CardTitle className="text-base font-semibold">Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {changes.map((c) => (
            <div key={c.label} className={`flex flex-col items-center gap-1 rounded-lg p-3 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
              <span className={`text-lg font-bold ${c.color}`}>{c.count}</span>
              <span className="text-[10px] font-medium text-neutral-500">{c.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
