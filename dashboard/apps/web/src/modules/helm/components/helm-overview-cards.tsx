'use client';

import { MetricCard } from '@aegisai/ui';
import {
  Activity,
  Container,
  Globe,
  Package,
  Server,
  Layers,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import type { HelmOverview, HelmHealth } from '../types';

interface HelmOverviewCardsProps {
  overview?: HelmOverview;
  health?: HelmHealth;
  isLoading?: boolean;
}

export function HelmOverviewCards({ overview, health, isLoading }: HelmOverviewCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  const healthStatus = health?.helm_installed ? 'installed' : 'unavailable';
  const healthColor = health?.helm_installed ? 'up' as const : 'down' as const;

  const cards = [
    { title: 'Helm Status', value: healthStatus, icon: <Activity className="h-4 w-4" />, trend: healthColor, trendValue: health?.cli_version || '' },
    { title: 'Releases', value: String(overview.total_releases), icon: <Container className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Healthy', value: String(overview.healthy_releases), icon: <CheckCircle className="h-4 w-4" />, trend: 'up' as const, trendValue: `${overview.total_releases > 0 ? Math.round(overview.healthy_releases / overview.total_releases * 100) : 0}%` },
    { title: 'Failed', value: String(overview.failed_releases), icon: <XCircle className="h-4 w-4" />, trend: overview.failed_releases > 0 ? 'down' as const : 'up' as const, trendValue: '' },
    { title: 'Namespaces', value: String(overview.namespace_count), icon: <Globe className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Repositories', value: String(overview.repository_count), icon: <Server className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Charts', value: String(overview.chart_count), icon: <Package className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Repos OK', value: health ? `${health.repositories_ok}/${health.repositories_total}` : '—', icon: <Layers className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
