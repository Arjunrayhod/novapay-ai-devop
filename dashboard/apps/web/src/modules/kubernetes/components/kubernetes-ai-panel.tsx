'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import type { ClusterHealth, ClusterMetrics, NodeInfo } from '../types';

interface KubernetesAIPanelProps {
  health?: ClusterHealth;
  metrics?: ClusterMetrics;
  nodes?: NodeInfo[];
  isLoading?: boolean;
}

export function KubernetesAIPanel({ health, metrics, nodes, isLoading }: KubernetesAIPanelProps) {
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

  if (health.status !== 'healthy') {
    const unhealthy = Object.entries(health.components || {}).filter(([_, v]) => !v).map(([k]) => k);
    if (unhealthy.length > 0) {
      insights.push({
        type: 'warning',
        message: `Unhealthy components: ${unhealthy.join(', ')}. Investigate immediately.`,
      });
    }
  }

  if (nodes) {
    const notReady = nodes.filter((n) => n.status !== 'Ready');
    if (notReady.length > 0) {
      insights.push({
        type: 'warning',
        message: `${notReady.length} node(s) not ready: ${notReady.map((n) => n.name).join(', ')}.`,
      });
    }
    const highCpuNodes = nodes.filter((n) => {
      if (n.cpu_allocatable <= 0) return false;
      const used = n.cpu_capacity - n.cpu_allocatable;
      const pct = (used / n.cpu_capacity) * 100;
      return pct > 80;
    });
    if (highCpuNodes.length > 0) {
      insights.push({
        type: 'info',
        message: `${highCpuNodes.length} node(s) have high CPU pressure. Consider optimizing workloads.`,
      });
    }
  }

  if (metrics && metrics.metrics_available) {
    if (metrics.cpu_utilization_percent > 80) {
      insights.push({
        type: 'warning',
        message: `Cluster-wide CPU utilization at ${metrics.cpu_utilization_percent}%. Consider scaling or optimizing.`,
      });
    }
    if (metrics.memory_utilization_percent > 80) {
      insights.push({
        type: 'warning',
        message: `Cluster-wide memory utilization at ${metrics.memory_utilization_percent}%. Investigate memory-heavy workloads.`,
      });
    }
    if (metrics.cpu_utilization_percent < 20 && metrics.memory_utilization_percent < 20) {
      insights.push({
        type: 'info',
        message: 'Cluster resources are significantly underutilized. Consider right-sizing. Placeholder: future cost optimization recommendations.',
      });
    }
  }

  if (health.storage_classes && health.storage_classes.length === 0) {
    insights.push({
      type: 'info',
      message: 'No storage classes detected. Dynamic provisioning may not be available.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      message: 'All systems nominal. Cluster is healthy and operating normally.',
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
        <p className="text-xs text-neutral-500">Kubernetes cluster analysis</p>
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
