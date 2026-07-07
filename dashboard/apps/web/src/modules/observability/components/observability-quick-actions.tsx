'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, FileText } from 'lucide-react';
import type { ObservabilityHealth, ObservabilityOverview, PrometheusAlert, PrometheusTarget, TempoService, GrafanaDashboard } from '../types';

interface ObservabilityQuickActionsProps {
  health?: ObservabilityHealth;
  overview?: ObservabilityOverview;
  alerts?: PrometheusAlert[];
  targets?: PrometheusTarget[];
  services?: TempoService[];
  dashboards?: GrafanaDashboard[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function ObservabilityQuickActions({
  health, overview, alerts, targets, services, dashboards,
  onRefresh, isRefreshing,
}: ObservabilityQuickActionsProps) {
  const handleExportJSON = () => {
    const data = { health, overview, alerts, targets, services, dashboards };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observability-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const lines: string[] = [
      '# Observability Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Health',
      `- Prometheus: ${health?.prometheus || 'N/A'}`,
      `- Grafana: ${health?.grafana || 'N/A'}`,
      `- Loki: ${health?.loki || 'N/A'}`,
      `- Tempo: ${health?.tempo || 'N/A'}`,
      `- OTel: ${health?.otel || 'N/A'}`,
      '',
      '## Overview',
      `- Active Alerts: ${overview?.active_alerts || 0}`,
      `- Active Targets: ${overview?.active_targets || 0}`,
      `- Active Services: ${overview?.active_services || 0}`,
      `- Dashboards: ${overview?.dashboards_count || 0}`,
      `- Datasources: ${overview?.datasources_count || 0}`,
    ];
    if (alerts && alerts.length > 0) {
      lines.push('', '## Active Alerts');
      for (const a of alerts) {
        lines.push(`- ${a.name} (${a.severity}) - ${a.state}`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observability-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiagnostics = async () => {
    const lines = [
      `Prometheus: ${health?.prometheus || 'N/A'}`,
      `Grafana: ${health?.grafana || 'N/A'}`,
      `Loki: ${health?.loki || 'N/A'}`,
      `Tempo: ${health?.tempo || 'N/A'}`,
      `OTel: ${health?.otel || 'N/A'}`,
      `Alerts: ${overview?.active_alerts || 0}`,
      `Targets: ${overview?.active_targets || 0}`,
      `Services: ${overview?.active_services || 0}`,
      `Dashboards: ${overview?.dashboards_count || 0}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
  };

  const actions = [
    { label: 'Refresh', icon: RefreshCw, onClick: onRefresh, spinning: isRefreshing },
    { label: 'Export JSON', icon: Download, onClick: handleExportJSON },
    { label: 'Export MD', icon: FileText, onClick: handleExportMarkdown },
    { label: 'Copy Diag', icon: Copy, onClick: handleCopyDiagnostics },
  ];

  return (
    <GlassCard>
      <GlassCardContent className="p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <action.icon className={`h-3.5 w-3.5 ${action.spinning ? 'animate-spin' : ''}`} />
              {action.label}
            </button>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
