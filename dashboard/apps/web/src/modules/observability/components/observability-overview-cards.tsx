'use client';

import { MetricCard } from '@aegisai/ui';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  FileSearch,
  Layers,
  ListMusic,
  Server,
} from 'lucide-react';
import type { ObservabilityOverview } from '../types';

interface ObservabilityOverviewCardsProps {
  overview?: ObservabilityOverview;
  isLoading?: boolean;
}

export function ObservabilityOverviewCards({ overview, isLoading }: ObservabilityOverviewCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  const trendUp = 'up' as const;
  const trendDown = 'down' as const;
  const trendNeutral = 'neutral' as const;

  const promTrend = overview.prometheus_healthy ? trendUp : trendDown;
  const graTrend = overview.grafana_healthy ? trendUp : trendDown;
  const lokTrend = overview.loki_healthy ? trendUp : trendDown;
  const temTrend = overview.tempo_healthy ? trendUp : trendDown;
  const alertTrend = overview.active_alerts > 0 ? trendUp : trendNeutral;

  const cards = [
    { title: 'Prometheus', value: overview.prometheus_healthy ? 'Healthy' : 'Unavailable', icon: <Activity className="h-4 w-4" />, trend: promTrend, trendValue: '' },
    { title: 'Grafana', value: overview.grafana_healthy ? 'Healthy' : 'Unavailable', icon: <BarChart3 className="h-4 w-4" />, trend: graTrend, trendValue: '' },
    { title: 'Loki', value: overview.loki_healthy ? 'Healthy' : 'Unavailable', icon: <FileSearch className="h-4 w-4" />, trend: lokTrend, trendValue: '' },
    { title: 'Tempo', value: overview.tempo_healthy ? 'Healthy' : 'Unavailable', icon: <ListMusic className="h-4 w-4" />, trend: temTrend, trendValue: '' },
    { title: 'Alerts', value: String(overview.active_alerts), icon: <AlertTriangle className="h-4 w-4" />, trend: alertTrend, trendValue: overview.active_alerts > 0 ? 'Active' : '' },
    { title: 'Targets', value: String(overview.active_targets), icon: <Server className="h-4 w-4" />, trend: trendNeutral, trendValue: '' },
    { title: 'Services', value: String(overview.active_services), icon: <Layers className="h-4 w-4" />, trend: trendNeutral, trendValue: '' },
    { title: 'Dashboards', value: String(overview.dashboards_count), icon: <Database className="h-4 w-4" />, trend: trendNeutral, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
