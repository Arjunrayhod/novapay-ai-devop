'use client';

import { MetricCard } from '@aegisai/ui';
import {
  Container,
  PlayCircle,
  Square,
  Image,
  HardDrive,
  Network,
  Activity,
  Cpu,
} from 'lucide-react';
import type { DockerInfo } from '../types';

interface DockerDashboardCardsProps {
  info?: DockerInfo;
  isLoading?: boolean;
}

export function DockerDashboardCards({ info, isLoading }: DockerDashboardCardsProps) {
  if (isLoading || !info) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: 'Engine Status', value: info.running ? 'Running' : 'Stopped', icon: <Activity className="h-4 w-4" />, trend: info.running ? 'up' as const : 'down' as const, trendValue: info.server_version || '' },
    { title: 'Containers Running', value: String(info.containers_running), icon: <PlayCircle className="h-4 w-4" />, trend: 'up' as const, trendValue: `/${info.containers_total}` },
    { title: 'Containers Stopped', value: String(info.containers_stopped), icon: <Square className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Images', value: String(info.images), icon: <Image className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Volumes', value: String(info.volumes), icon: <HardDrive className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Networks', value: String(info.networks), icon: <Network className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'CPU Cores', value: String(info.cpus || '—'), icon: <Cpu className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
    { title: 'Memory', value: info.memory ? `${(info.memory / 1024 / 1024 / 1024).toFixed(1)} GB` : '—', icon: <Container className="h-4 w-4" />, trend: 'neutral' as const, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
