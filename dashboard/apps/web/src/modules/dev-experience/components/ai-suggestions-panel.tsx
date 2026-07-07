'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Lightbulb, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { AISuggestion } from '../types';

interface AISuggestionsPanelProps {
  suggestions?: AISuggestion[];
  isLoading?: boolean;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-danger-50/50 dark:bg-danger-900/10',
    iconColor: 'text-danger-500',
    border: 'border-l-danger-500',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-warning-50/50 dark:bg-warning-900/10',
    iconColor: 'text-warning-500',
    border: 'border-l-warning-500',
  },
  info: {
    icon: Info,
    bg: 'bg-accent-50/50 dark:bg-accent-900/10',
    iconColor: 'text-accent-500',
    border: 'border-l-accent-500',
  },
};

export function AISuggestionsPanel({ suggestions, isLoading }: AISuggestionsPanelProps) {
  if (isLoading || !suggestions) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (suggestions.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-success-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              AI Suggestions
            </h3>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm text-neutral-500">No issues found. Your environment is ready.</p>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            AI Onboarding Suggestions
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          {suggestions.filter((s) => s.severity === 'critical').length} critical,{' '}
          {suggestions.filter((s) => s.severity === 'warning').length} warning,{' '}
          {suggestions.filter((s) => s.severity === 'info').length} info
        </p>
      </GlassCardHeader>
      <GlassCardContent className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const config = severityConfig[suggestion.severity];
          const Icon = config.icon;
          return (
            <div
              key={index}
              className={`rounded-lg border-l-4 p-3 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      {suggestion.tool_name || 'System'}
                    </span>
                    <span className={`text-[10px] font-medium uppercase ${config.iconColor}`}>
                      {suggestion.severity}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {suggestion.reason}
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium">Recommendation:</span> {suggestion.recommendation}
                  </p>
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium">Fix:</span> {suggestion.suggested_fix}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </GlassCardContent>
    </GlassCard>
  );
}
