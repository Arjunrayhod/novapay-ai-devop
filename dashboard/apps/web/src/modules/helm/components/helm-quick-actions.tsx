'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, FileText } from 'lucide-react';
import type { HelmOverview, HelmHealth, HelmVersion, HelmRelease, HelmRepository, HelmChart } from '../types';

interface HelmQuickActionsProps {
  overview?: HelmOverview;
  health?: HelmHealth;
  version?: HelmVersion;
  releases?: HelmRelease[];
  repositories?: HelmRepository[];
  charts?: HelmChart[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function HelmQuickActions({
  overview, health, version, releases, repositories, charts,
  onRefresh, isRefreshing,
}: HelmQuickActionsProps) {
  const handleExportJSON = async () => {
    const data = { overview, health, version, releases, repositories, charts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helm-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    const lines: string[] = [
      '# Helm Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Overview',
      `- Helm Version: ${version?.version || 'N/A'}`,
      `- Helm Installed: ${health?.helm_installed ? 'Yes' : 'No'}`,
      `- Total Releases: ${overview?.total_releases || 0}`,
      `- Healthy Releases: ${overview?.healthy_releases || 0}`,
      `- Failed Releases: ${overview?.failed_releases || 0}`,
      `- Namespaces: ${overview?.namespace_count || 0}`,
      `- Repositories: ${overview?.repository_count || 0}`,
      `- Charts: ${overview?.chart_count || 0}`,
      '',
      '## Releases',
    ];
    if (releases) {
      for (const r of releases) {
        lines.push(`- ${r.namespace}/${r.name}: ${r.status} (v${r.revision})`);
      }
    }
    lines.push('', '## Repositories');
    if (repositories) {
      for (const r of repositories) {
        lines.push(`- ${r.name}: ${r.url} (${r.status})`);
      }
    }
    lines.push('', '## Charts');
    if (charts) {
      for (const c of charts.slice(0, 20)) {
        lines.push(`- ${c.name}: ${c.version} (${c.repo})`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helm-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiagnostics = async () => {
    const lines = [
      `Helm: ${version?.version || 'N/A'}`,
      `Installed: ${health?.helm_installed ? 'Yes' : 'No'}`,
      `Releases: ${overview?.total_releases || 0} total, ${overview?.healthy_releases || 0} healthy, ${overview?.failed_releases || 0} failed`,
      `Namespaces: ${overview?.namespace_count || 0}`,
      `Repositories: ${overview?.repository_count || 0}`,
      `Charts: ${overview?.chart_count || 0}`,
      `Repos OK: ${health?.repositories_ok}/${health?.repositories_total}`,
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
