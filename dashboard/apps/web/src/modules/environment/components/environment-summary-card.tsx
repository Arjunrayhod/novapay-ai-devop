'use client';

import { Card, CardContent } from '@aegisai/ui';
import { Server, Cpu, HardDrive, Activity } from 'lucide-react';
import type { SystemInfo } from '../types';

interface EnvironmentSummaryCardProps {
  system?: SystemInfo;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function EnvironmentSummaryCard({ system, isLoading }: EnvironmentSummaryCardProps) {
  if (isLoading || !system) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="h-5 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'OS', value: system.os, icon: Server },
    { label: 'CPU', value: `${system.cpu_cores} cores`, icon: Cpu },
    { label: 'RAM', value: formatBytes(system.ram_total), icon: HardDrive },
    { label: 'Disk', value: formatBytes(system.disk_total), icon: Activity },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Server className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {system.hostname}
          </h3>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {system.architecture}
          </span>
        </div>
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
      </CardContent>
    </Card>
  );
}
