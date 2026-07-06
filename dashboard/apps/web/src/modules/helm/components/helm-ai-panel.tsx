'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import type { HelmHealth, HelmOverview } from '../types';

interface HelmAIPanelProps {
  health?: HelmHealth;
  overview?: HelmOverview;
  isLoading?: boolean;
}

export function HelmAIPanel({ health, overview, isLoading }: HelmAIPanelProps) {
  if (isLoading || !health) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />)}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const insights: { type: 'info' | 'warning' | 'success'; message: string }[] = [];

  if (!health.helm_installed) {
    insights.push({
      type: 'warning',
      message: 'Helm CLI is not installed or not in PATH. Install Helm v3 to manage releases.',
    });
  }

  if (health.repositories_ok < health.repositories_total) {
    insights.push({
      type: 'warning',
      message: `${health.repositories_total - health.repositories_ok} repository(s) have errors. Run helm repo list to diagnose.`,
    });
  }

  if (overview && overview.failed_releases > 0) {
    insights.push({
      type: 'warning',
      message: `${overview.failed_releases} release(s) in failed state. Investigate with helm history.`,
    });
  }

  if (overview && overview.healthy_releases === overview.total_releases && overview.total_releases > 0) {
    insights.push({
      type: 'success',
      message: `All ${overview.total_releases} release(s) are healthy. No issues detected.`,
    });
  }

  if (overview && overview.repository_count === 0 && health.helm_installed) {
    insights.push({
      type: 'info',
      message: 'No Helm repositories configured. Add repositories to deploy charts.',
    });
  }

  if (insights.length === 0 && health.helm_installed) {
    insights.push({
      type: 'success',
      message: 'Helm is operational. All systems nominal.',
    });
  }

  const typeIcon = { info: Sparkles, warning: AlertTriangle, success: Lightbulb };
  const typeColor = { info: 'text-accent-500', warning: 'text-warning-500', success: 'text-success-500' };
  const typeBg = { info: 'bg-accent-50/50 dark:bg-accent-900/10', warning: 'bg-warning-50/50 dark:bg-warning-900/10', success: 'bg-success-50/50 dark:bg-success-900/10' };

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">AI Insights</h3>
        </div>
        <p className="text-xs text-neutral-500">Helm release analysis</p>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = typeIcon[insight.type];
            return (
              <div key={index} className={`flex items-start gap-2.5 rounded-lg p-3 text-xs ${typeBg[insight.type]}`}>
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
