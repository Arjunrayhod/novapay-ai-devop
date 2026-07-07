'use client';

import { MetricCard } from '@aegisai/ui';
import { AlertTriangle, FileSearch, Layers, Lock, Server, Shield } from 'lucide-react';
import type { SecurityOverview } from '../types';

interface Props {
  overview?: SecurityOverview;
  isLoading?: boolean;
}

export function SecurityOverviewCards({ overview, isLoading }: Props) {
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

  const sastTrend = overview.sast_available ? trendUp : trendDown;
  const depTrend = overview.dependency_scan_available ? trendUp : trendDown;
  const vulnTrend = overview.critical_count > 0 ? trendDown : trendNeutral;
  const opaTrend = overview.opa_available ? trendUp : trendDown;

  const cards = [
    { title: 'SAST Scanner', value: overview.sast_available ? 'Active' : 'Unavailable', icon: <FileSearch className="h-4 w-4" />, trend: sastTrend, trendValue: '' },
    { title: 'Dependency Scan', value: overview.dependency_scan_available ? 'Active' : 'Unavailable', icon: <Shield className="h-4 w-4" />, trend: depTrend, trendValue: '' },
    { title: 'Total Issues', value: String(overview.total_issues), icon: <AlertTriangle className="h-4 w-4" />, trend: vulnTrend, trendValue: `C:${overview.critical_count} H:${overview.high_count}` },
    { title: 'OPA Policies', value: String(overview.policy_count), icon: <Layers className="h-4 w-4" />, trend: opaTrend, trendValue: '' },
    { title: 'Critical', value: String(overview.critical_count), icon: <AlertTriangle className="h-4 w-4" />, trend: overview.critical_count > 0 ? trendDown : trendNeutral, trendValue: '' },
    { title: 'High', value: String(overview.high_count), icon: <AlertTriangle className="h-4 w-4" />, trend: overview.high_count > 0 ? trendDown : trendNeutral, trendValue: '' },
    { title: 'Medium', value: String(overview.medium_count), icon: <Server className="h-4 w-4" />, trend: trendNeutral, trendValue: '' },
    { title: 'Compliance', value: `${overview.compliance_score}%`, icon: <Lock className="h-4 w-4" />, trend: overview.compliance_score >= 80 ? trendUp : trendDown, trendValue: '' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
