'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import type { ContainerStats, DockerInfo, ImageInfo } from '../types';

interface DockerAIPanelProps {
  info?: DockerInfo;
  stats?: ContainerStats[];
  images?: ImageInfo[];
  isLoading?: boolean;
}

export function DockerAIPanel({ info, stats, images, isLoading }: DockerAIPanelProps) {
  if (isLoading || !info) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const insights: { type: 'info' | 'warning' | 'success'; message: string }[] = [];

  if (stats) {
    const highMemory = stats.filter((s) => s.memory_percent > 50);
    if (highMemory.length > 0) {
      insights.push({
        type: 'warning',
        message: `${highMemory.length} container(s) consume high memory (>50%).`,
      });
    }
    const highCpu = stats.filter((s) => s.cpu_percent > 80);
    if (highCpu.length > 0) {
      insights.push({
        type: 'warning',
        message: `${highCpu.length} container(s) have high CPU usage (>80%).`,
      });
    }
  }

  if (images && images.length > 0) {
    const untagged = images.filter((i) => i.repository === '<none>');
    if (untagged.length > 0) {
      insights.push({
        type: 'info',
        message: `${untagged.length} dangling image(s) detected. These can be safely removed.`,
      });
    }
  }

  if (info.disk_usage && typeof info.disk_usage.layers_size === 'number') {
    const reclaimable = info.disk_usage.layers_size + (info.disk_usage.containers_size || 0);
    if (reclaimable > 0) {
      const size = reclaimable / 1024 / 1024 / 1024;
      insights.push({
        type: 'info',
        message: `~${size.toFixed(1)} GB potentially reclaimable from unused layers and stopped containers.`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      message: 'All systems nominal. No issues detected.',
    });
  }

  const typeIcon = {
    info: Sparkles,
    warning: AlertTriangle,
    success: Lightbulb,
  };

  const typeColor = {
    info: 'text-accent-500',
    warning: 'text-warning-500',
    success: 'text-success-500',
  };

  const typeBg = {
    info: 'bg-accent-50/50 dark:bg-accent-900/10',
    warning: 'bg-warning-50/50 dark:bg-warning-900/10',
    success: 'bg-success-50/50 dark:bg-success-900/10',
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            AI Insights
          </h3>
        </div>
        <p className="text-xs text-neutral-500">Docker environment analysis</p>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = typeIcon[insight.type];
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 rounded-lg p-3 text-xs ${typeBg[insight.type]}`}
              >
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${typeColor[insight.type]}`} />
                <span className="text-neutral-700 dark:text-neutral-300">{insight.message}</span>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
