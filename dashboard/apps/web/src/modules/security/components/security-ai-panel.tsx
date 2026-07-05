'use client';

import { Card, GlassCard } from '@aegisai/ui';
import { Brain, Shield } from 'lucide-react';
import type { SecurityHealth, SecurityOverview } from '../types';

interface Props {
  health?: SecurityHealth;
  overview?: SecurityOverview;
  isLoading?: boolean;
}

export function SecurityAIPanel({ health, overview, isLoading }: Props) {
  if (isLoading || !health || !overview) {
    return (
      <Card>
        <div className="h-48 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </Card>
    );
  }

  const insights: string[] = [];

  if (overview.critical_count > 0) {
    insights.push(`Critical vulnerabilities detected. Immediate remediation required.`);
  }
  if (overview.high_count > 5) {
    insights.push(`High volume of high-severity issues. Prioritize triage.`);
  }
  if (!overview.sast_available) {
    insights.push(`SAST scanner not available. Install bandit for deeper analysis.`);
  }
  if (!overview.opa_available) {
    insights.push(`OPA not found. Policy evaluation requires Open Policy Agent.`);
  }
  if (overview.compliance_score >= 80) {
    insights.push(`Compliance score is strong. Continuing monitoring recommended.`);
  } else if (overview.compliance_score > 0) {
    insights.push(`Compliance score needs attention. Review failed checks.`);
  }
  if (overview.policy_count === 0) {
    insights.push(`No OPA policies discovered. Define policies in /policies/ directory.`);
  }
  if (!insights.length) {
    insights.push('All security systems operational and within acceptable thresholds.');
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-5 w-5 text-accent-600 dark:text-accent-400" />
        <h3 className="text-lg font-semibold">Security Insights</h3>
        <Shield className="h-4 w-4 ml-auto text-neutral-400" />
      </div>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            {insight}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
