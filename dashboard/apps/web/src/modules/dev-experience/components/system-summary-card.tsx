'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Server, Cpu, HardDrive, Wrench } from 'lucide-react';
import type { ScanSystemInfo, ScanToolInfo } from '../types';

interface SystemSummaryCardProps {
  system?: ScanSystemInfo | null;
  tools?: ScanToolInfo[];
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function SystemSummaryCard({ system, tools, isLoading }: SystemSummaryCardProps) {
  if (isLoading || !system || !tools) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const installed = tools.filter((t) => t.installed).length;
  const missing = tools.length - installed;

  const stats = [
    { label: 'OS', value: system.os, icon: Server },
    { label: 'CPU', value: `${system.cpu_cores} cores`, icon: Cpu },
    { label: 'RAM', value: formatBytes(system.ram_total), icon: HardDrive },
    { label: 'Tools', value: `${installed}/${tools.length}`, icon: Wrench },
  ];

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {system.hostname}
          </h3>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {system.architecture}
          </span>
        </div>
        {missing > 0 && (
          <p className="text-xs text-warning-500">
            {missing} tool{missing > 1 ? 's' : ''} missing — review recommendations
          </p>
        )}
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Icon className="h-3 w-3" />
                  <span>{stat.label}</span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
