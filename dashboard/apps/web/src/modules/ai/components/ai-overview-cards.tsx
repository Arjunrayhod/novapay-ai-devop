'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { Bot, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import type { AIHealth, AIOverview, Insight, Recommendation } from '../types';

interface AIOverviewCardsProps {
  health?: AIHealth;
  overview?: AIOverview;
  insights?: Insight[];
  recommendations?: Recommendation[];
  isLoading?: boolean;
}

export function AIOverviewCards({ health, overview, insights, recommendations, isLoading }: AIOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i}>
            <GlassCardContent>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-8 w-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-3 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
    );
  }

  const criticalRisks = recommendations?.filter((r) => r.severity === 'high' || r.severity === 'critical').length ?? 0;
  const activeInsights = insights?.length ?? 0;
  const providerName = overview?.provider_name ?? health?.provider ?? 'unavailable';
  const providerStatus = health?.available ? 'Online' : 'Offline';
  const providerModel = overview?.model ?? health?.model ?? '-';

  const cards = [
    {
      icon: Bot,
      label: 'AI Provider',
      value: providerName,
      sub: providerStatus,
      color: 'text-primary-500',
      bg: 'bg-primary-50/50 dark:bg-primary-900/10',
    },
    {
      icon: Lightbulb,
      label: 'Active Insights',
      value: String(activeInsights),
      sub: 'Platform analysis',
      color: 'text-accent-500',
      bg: 'bg-accent-50/50 dark:bg-accent-900/10',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Risks',
      value: String(criticalRisks),
      sub: 'Requires attention',
      color: criticalRisks > 0 ? 'text-error-500' : 'text-success-500',
      bg: criticalRisks > 0 ? 'bg-error-50/50 dark:bg-error-900/10' : 'bg-success-50/50 dark:bg-success-900/10',
    },
    {
      icon: Sparkles,
      label: 'AI Model',
      value: providerModel,
      sub: 'Active provider model',
      color: 'text-neutral-500',
      bg: 'bg-neutral-50/50 dark:bg-neutral-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.label}>
            <GlassCardContent>
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-neutral-500">{card.label}</div>
                <div className="mt-0.5 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {card.value}
                </div>
                <div className="mt-0.5 text-xs text-neutral-400">{card.sub}</div>
              </div>
            </GlassCardContent>
          </GlassCard>
        );
      })}
    </div>
  );
}
