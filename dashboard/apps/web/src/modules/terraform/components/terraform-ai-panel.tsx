'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import type { TerraformHealth, TerraformOverview, TerraformModule, TerraformProvider } from '../types';

interface TerraformAIPanelProps {
  health?: TerraformHealth;
  overview?: TerraformOverview;
  modules?: TerraformModule[];
  providers?: TerraformProvider[];
  isLoading?: boolean;
}

export function TerraformAIPanel({ health, overview, modules, providers, isLoading }: TerraformAIPanelProps) {
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

  if (!health.terraform_installed) {
    insights.push({
      type: 'warning',
      message: 'Terraform CLI is not installed or not in PATH. Install Terraform to manage infrastructure.',
    });
  }

  if (health.terraform_installed && health.provider_count === 0) {
    insights.push({
      type: 'info',
      message: 'No providers configured. Add provider blocks to your Terraform configuration.',
    });
  }

  if (overview && overview.resource_count > 50) {
    insights.push({
      type: 'info',
      message: `Large state file detected: ${overview.resource_count} resources. Consider splitting into workspaces or using remote state.`,
    });
  }

  if (modules && modules.some((m) => m.resource_count > 20)) {
    insights.push({
      type: 'info',
      message: `${modules.filter((m) => m.resource_count > 20).length} module(s) contain over 20 resources. Consider refactoring large modules.`,
    });
  }

  if (providers && providers.filter((p) => !p.source).length > 0) {
    insights.push({
      type: 'warning',
      message: `${providers.filter((p) => !p.source).length} provider(s) have no source defined. This may cause issues with provider resolution.`,
    });
  }

  if (health.state_loaded && health.terraform_installed) {
    insights.push({
      type: 'success',
      message: `State is loaded with ${overview?.resource_count || 0} resources across ${overview?.module_count || 0} modules.`,
    });
  }

  if (insights.length === 0 && health.terraform_installed) {
    insights.push({
      type: 'success',
      message: 'Terraform is operational. All systems nominal.',
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
        <p className="text-xs text-neutral-500">Terraform configuration analysis</p>
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
