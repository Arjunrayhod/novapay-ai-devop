'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import type { ObservabilityOverview, ObservabilityHealth, PrometheusAlert } from '../types';

interface ObservabilityAIPanelProps {
  overview?: ObservabilityOverview;
  health?: ObservabilityHealth;
  alerts?: PrometheusAlert[];
  isLoading?: boolean;
}

export function ObservabilityAIPanel({ overview, health, alerts, isLoading }: ObservabilityAIPanelProps) {
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

  if (health.prometheus !== 'healthy') {
    insights.push({ type: 'warning', message: 'Prometheus is unreachable. Metrics may be stale or unavailable.' });
  }

  if (health.grafana !== 'healthy') {
    insights.push({ type: 'info', message: 'Grafana is not responding. Dashboards and datasources cannot be loaded.' });
  }

  if (health.loki !== 'healthy') {
    insights.push({ type: 'info', message: 'Loki is unavailable. Log queries will return empty results.' });
  }

  if (health.tempo !== 'healthy') {
    insights.push({ type: 'info', message: 'Tempo is not reachable. Trace data cannot be retrieved.' });
  }

  if (alerts && alerts.length > 5) {
    insights.push({ type: 'warning', message: `High alert count: ${alerts.length} active alerts. Investigate immediately.` });
  }

  if (alerts && alerts.some((a) => a.severity === 'critical')) {
    insights.push({ type: 'warning', message: 'Critical alerts detected. Immediate attention required.' });
  }

  if (overview && overview.active_targets === 0 && health.prometheus === 'healthy') {
    insights.push({ type: 'info', message: 'No active Prometheus targets. Check scrape configuration.' });
  }

  if (insights.length === 0) {
    insights.push({ type: 'success', message: 'All observability services are operational. Systems nominal.' });
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
        <p className="text-xs text-neutral-500">Observability health analysis</p>
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
