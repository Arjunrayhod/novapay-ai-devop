'use client';

import { MetricCard } from '@aegisai/ui';
import {
  Activity,
  Box,
  Package,
  Cpu,
  Server,
  Database,
  FileJson,
  CheckCircle,
} from 'lucide-react';
import type { TerraformOverview, TerraformHealth } from '../types';

interface TerraformOverviewCardsProps {
  overview?: TerraformOverview;
  health?: TerraformHealth;
  isLoading?: boolean;
}

export function TerraformOverviewCards({ overview, health, isLoading }: TerraformOverviewCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  const statusText = overview.terraform_installed ? 'installed' : 'unavailable';
  const statusTrend = overview.terraform_installed ? 'up' as const : 'down' as const;

  const cards = [
    { title: 'Terraform', value: statusText, icon: <Activity className="h-4 w-4" />, trend: statusTrend, trendValue: overview.cli_version || '' },
    { title: 'Modules', value: String(overview.module_count), icon: <Box className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Resources', value: String(overview.resource_count), icon: <Package className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Providers', value: String(overview.provider_count), icon: <Cpu className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Outputs', value: String(overview.output_count), icon: <FileJson className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'State', value: overview.state_loaded ? 'Loaded' : 'Empty', icon: <Database className="h-4 w-4" />, trend: overview.state_loaded ? 'up' as const : 'neutral' as const, trendValue: '' },
    { title: 'State Version', value: health?.state_loaded ? 'Synced' : '—', icon: <CheckCircle className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Providers OK', value: health ? `${health.provider_count}` : '—', icon: <Server className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
