'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, FileText } from 'lucide-react';
import type { DockerInfo, ContainerInfo, ImageInfo, NetworkInfo, VolumeInfo, DockerVersion } from '../types';

interface DockerQuickActionsProps {
  info?: DockerInfo;
  containers?: ContainerInfo[];
  images?: ImageInfo[];
  networks?: NetworkInfo[];
  volumes?: VolumeInfo[];
  version?: DockerVersion;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DockerQuickActions({ info, containers, images, networks, volumes, version, onRefresh, isRefreshing }: DockerQuickActionsProps) {
  const handleExportJSON = async () => {
    const data = { info, containers, images, networks, volumes, version };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docker-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    const lines: string[] = [
      '# Docker Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## System',
      `- Engine: ${info?.server_version || 'N/A'}`,
      `- Containers: ${info?.containers_running} running / ${info?.containers_stopped} stopped / ${info?.containers_total} total`,
      `- Images: ${info?.images}`,
      `- Volumes: ${info?.volumes}`,
      `- Networks: ${info?.networks}`,
      '',
      '## Containers',
    ];
    if (containers) {
      for (const c of containers) {
        lines.push(`- ${c.name} (${c.image}): ${c.status}`);
      }
    }
    lines.push('', '## Images');
    if (images) {
      for (const img of images) {
        lines.push(`- ${img.repository}:${img.tag} (${img.size})`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docker-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiagnostics = async () => {
    const lines = [
      `Docker Engine: ${info?.server_version || 'N/A'}`,
      `API Version: ${version?.api_version || 'N/A'}`,
      `Containers: ${info?.containers_running} running / ${info?.containers_stopped} stopped / ${info?.containers_total} total`,
      `Images: ${info?.images}`,
      `Volumes: ${info?.volumes}`,
      `Networks: ${info?.networks}`,
      `OS: ${info?.os || 'N/A'}`,
      `Storage Driver: ${info?.driver || 'N/A'}`,
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
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Quick Actions
        </h3>
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
