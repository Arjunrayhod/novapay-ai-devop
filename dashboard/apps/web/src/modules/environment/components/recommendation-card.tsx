'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Lightbulb, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ToolInfo, ValidationResult } from '../types';

interface RecommendationCardProps {
  tools?: ToolInfo[];
  validation?: ValidationResult[];
  isLoading?: boolean;
}

export function RecommendationCard({ tools, validation, isLoading }: RecommendationCardProps) {
  if (isLoading || !tools || !validation) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const recommendations: { type: 'info' | 'warning' | 'success'; message: string }[] = [];

  for (const tool of tools) {
    if (!tool.installed) {
      recommendations.push({
        type: 'warning',
        message: `${tool.name} is not installed. Install it for full platform functionality.`,
      });
    } else if (tool.error) {
      recommendations.push({
        type: 'info',
        message: `${tool.name}: ${tool.error}`,
      });
    }
  }

  for (const v of validation) {
    if (v.status === 'FAILED') {
      recommendations.push({
        type: 'warning',
        message: v.message,
      });
    } else if (v.status === 'WARNING') {
      recommendations.push({
        type: 'info',
        message: v.message,
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'All systems are ready. Your environment is fully configured.',
    });
  }

  const typeIcon = {
    info: Sparkles,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const typeColor = {
    info: 'text-accent-500',
    warning: 'text-warning-500',
    success: 'text-success-500',
  };

  const typeBg = {
    info: 'bg-accent-50/50 dark:bg-accent-900/10',
    warning: 'bg-warning-50/50 dark:bg-warning-900/10',
    success: 'bg-success-50/50 dark:bg-success-900/10',
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            AI Recommendations
          </h3>
        </div>
        <p className="text-xs text-neutral-500">Platform readiness insights</p>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {recommendations.map((rec, index) => {
            const Icon = typeIcon[rec.type];
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 rounded-lg p-3 text-xs ${typeBg[rec.type]}`}
              >
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${typeColor[rec.type]}`} />
                <span className="text-neutral-700 dark:text-neutral-300">{rec.message}</span>
              </div>
            );
          })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
