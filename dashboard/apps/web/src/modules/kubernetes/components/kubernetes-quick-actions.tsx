'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, FileText } from 'lucide-react';
import type { ClusterInfo, ClusterHealth, VersionInfo, NodeInfo, PodInfo, DeploymentInfo } from '../types';

interface KubernetesQuickActionsProps {
  cluster?: ClusterInfo;
  health?: ClusterHealth;
  version?: VersionInfo;
  nodes?: NodeInfo[];
  pods?: PodInfo[];
  deployments?: DeploymentInfo[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function KubernetesQuickActions({
  cluster, health, version, nodes, pods, deployments,
  onRefresh, isRefreshing,
}: KubernetesQuickActionsProps) {
  const handleExportJSON = async () => {
    const data = { cluster, health, version, nodes, pods, deployments };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kubernetes-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    const lines: string[] = [
      '# Kubernetes Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Cluster',
      `- Version: ${version?.git_version || 'N/A'}`,
      `- Nodes: ${cluster?.nodes_ready}/${cluster?.nodes_total} ready`,
      `- Namespaces: ${cluster?.namespaces}`,
      `- Pods: ${cluster?.pods_running}/${cluster?.pods_total} running`,
      `- Services: ${cluster?.services}`,
      `- Health: ${health?.status || 'N/A'}`,
      '',
      '## Nodes',
    ];
    if (nodes) {
      for (const n of nodes) {
        lines.push(`- ${n.name} (${n.status}): ${n.roles.join(', ')}`);
      }
    }
    lines.push('', '## Pods');
    if (pods) {
      for (const p of pods.slice(0, 20)) {
        lines.push(`- ${p.namespace}/${p.name}: ${p.status}`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kubernetes-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiagnostics = async () => {
    const lines = [
      `Kubernetes: ${version?.git_version || 'N/A'}`,
      `Nodes: ${cluster?.nodes_ready}/${cluster?.nodes_total} ready`,
      `Pods: ${cluster?.pods_running}/${cluster?.pods_total} running`,
      `Namespaces: ${cluster?.namespaces}`,
      `Services: ${cluster?.services}`,
      `Health: ${health?.status || 'N/A'}`,
      `API Server: ${health?.components?.api_server ? 'OK' : 'DOWN'}`,
      `CoreDNS: ${health?.components?.core_dns ? 'OK' : 'DOWN'}`,
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
