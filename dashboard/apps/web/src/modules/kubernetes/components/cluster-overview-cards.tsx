'use client';

import { MetricCard } from '@aegisai/ui';
import {
  Activity,
  Container,
  Cpu,
  Globe,
  HardDrive,
  Layers,
  Server,
} from 'lucide-react';
import type { ClusterInfo, ClusterHealth } from '../types';

interface ClusterOverviewCardsProps {
  cluster?: ClusterInfo;
  health?: ClusterHealth;
  isLoading?: boolean;
}

export function ClusterOverviewCards({ cluster, health, isLoading }: ClusterOverviewCardsProps) {
  if (isLoading || !cluster) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  const healthStatus = health?.status ?? 'unknown';
  const healthColor = healthStatus === 'healthy' ? 'up' as const : healthStatus === 'degraded' ? 'down' as const : 'neutral' as const;

  const memoryGb = cluster.total_memory_bytes ? (cluster.total_memory_bytes / 1024 / 1024 / 1024).toFixed(1) : '—';

  const cards = [
    { title: 'Cluster Status', value: healthStatus, icon: <Activity className="h-4 w-4" />, trend: healthColor, trendValue: cluster.version?.git_version || '' },
    { title: 'Nodes', value: `${cluster.nodes_ready}/${cluster.nodes_total}`, icon: <Server className="h-4 w-4" />, trend: cluster.nodes_ready === cluster.nodes_total ? 'up' as const : 'down' as const, trendValue: 'ready' },
    { title: 'Namespaces', value: String(cluster.namespaces), icon: <Globe className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Running Pods', value: `${cluster.pods_running}/${cluster.pods_total}`, icon: <Container className="h-4 w-4" />, trend: 'up' as const, trendValue: '' },
    { title: 'Deployments', value: String('—'), icon: <Layers className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Services', value: String(cluster.services), icon: <Globe className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'CPU Cores', value: String(cluster.total_cpu_cores), icon: <Cpu className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Memory', value: memoryGb === '—' ? '—' : `${memoryGb} GB`, icon: <HardDrive className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
