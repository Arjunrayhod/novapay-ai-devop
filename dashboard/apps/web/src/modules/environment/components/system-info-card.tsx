'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { User, Monitor, Cpu, HardDrive, Zap } from 'lucide-react';
import type { SystemInfo } from '../types';

interface SystemInfoCardProps {
  system?: SystemInfo;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function SystemInfoCard({ system, isLoading }: SystemInfoCardProps) {
  if (isLoading || !system) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 flex-1 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const details = [
    { label: 'Username', value: system.username, icon: User },
    { label: 'Hostname', value: system.hostname, icon: Monitor },
    { label: 'Platform', value: `${system.os} (${system.architecture})`, icon: Monitor },
    { label: 'Processor', value: system.cpu, icon: Cpu },
    { label: 'CPU Frequency', value: system.cpu_frequency, icon: Zap },
    { label: 'RAM Usage', value: `${formatBytes(system.ram_total)} total, ${formatBytes(system.ram_available)} available`, icon: HardDrive },
  ];

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          System Information
        </h3>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {details.map((detail) => {
            const Icon = detail.icon;
            return (
              <div key={detail.label} className="flex items-start gap-3 text-sm">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <div className="flex-1">
                  <span className="text-neutral-500 dark:text-neutral-400">{detail.label}:</span>{' '}
                  <span className="text-neutral-800 dark:text-neutral-200">{detail.value}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Disk Usage</span>
            <span>{system.disk_percent.toFixed(0)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${system.disk_percent}%` }}
            />
          </div>
          <p className="mt-0.5 text-[10px] text-neutral-400">
            {formatBytes(system.disk_used)} used / {formatBytes(system.disk_free)} free
          </p>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
