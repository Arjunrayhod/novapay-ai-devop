'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { Database } from 'lucide-react';
import type { TerraformState } from '../types';

interface StateViewerProps {
  state?: TerraformState;
  isLoading?: boolean;
}

export function StateViewer({ state, isLoading }: StateViewerProps) {
  if (isLoading || !state) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">State Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { label: 'State Version', value: state.version },
    { label: 'Terraform Version', value: state.terraform_version },
    { label: 'Resources', value: String(state.resource_count) },
    { label: 'Modules', value: String(state.module_count) },
    { label: 'Outputs', value: String(state.output_count) },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-neutral-400" />
          <CardTitle className="text-base font-semibold">State Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-800/30">
              <span className="text-neutral-700 dark:text-neutral-300">{item.label}</span>
              <span className="font-mono text-[11px] text-neutral-500">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
