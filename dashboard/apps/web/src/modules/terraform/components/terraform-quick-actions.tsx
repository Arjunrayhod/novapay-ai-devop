'use client';

import { GlassCard, GlassCardContent } from '@aegisai/ui';
import { RefreshCw, Download, Copy, FileText } from 'lucide-react';
import type { TerraformOverview, TerraformHealth, TerraformVersion, TerraformState, TerraformModule, TerraformResource, TerraformProvider, TerraformOutput, TerraformPlan } from '../types';

interface TerraformQuickActionsProps {
  overview?: TerraformOverview;
  health?: TerraformHealth;
  version?: TerraformVersion;
  state?: TerraformState;
  modules?: TerraformModule[];
  resources?: TerraformResource[];
  providers?: TerraformProvider[];
  outputs?: TerraformOutput[];
  plan?: TerraformPlan;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function TerraformQuickActions({
  overview, health, version, state, modules, resources, providers, outputs, plan,
  onRefresh, isRefreshing,
}: TerraformQuickActionsProps) {
  const handleExportJSON = async () => {
    const data = { overview, health, version, state, modules, resources, providers, outputs, plan };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terraform-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    const lines: string[] = [
      '# Terraform Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Overview',
      `- Terraform Version: ${version?.version || 'N/A'}`,
      `- Terraform Installed: ${health?.terraform_installed ? 'Yes' : 'No'}`,
      `- State Loaded: ${state?.terraform_version || 'No'}`,
      `- Modules: ${overview?.module_count || 0}`,
      `- Resources: ${overview?.resource_count || 0}`,
      `- Providers: ${overview?.provider_count || 0}`,
      `- Outputs: ${overview?.output_count || 0}`,
      '',
      '## Modules',
    ];
    if (modules) {
      for (const m of modules) {
        lines.push(`- ${m.address}: ${m.source} (${m.version || 'N/A'}) - ${m.resource_count} resources`);
      }
    }
    lines.push('', '## Providers');
    if (providers) {
      for (const p of providers) {
        lines.push(`- ${p.name}: ${p.version} (${p.source})`);
      }
    }
    lines.push('', '## Resources');
    if (resources) {
      for (const r of resources.slice(0, 30)) {
        lines.push(`- ${r.address} (${r.type}.${r.name})`);
      }
      if (resources.length > 30) lines.push(`- ... and ${resources.length - 30} more`);
    }
    if (plan && plan.available) {
      lines.push('', '## Plan', `- Add: ${plan.resources_add}`, `- Change: ${plan.resources_change}`, `- Destroy: ${plan.resources_destroy}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terraform-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiagnostics = async () => {
    const lines = [
      `Terraform: ${version?.version || 'N/A'}`,
      `Installed: ${health?.terraform_installed ? 'Yes' : 'No'}`,
      `State: ${state?.terraform_version || 'N/A'} (${overview?.state_loaded ? 'Loaded' : 'Empty'})`,
      `Modules: ${overview?.module_count || 0}`,
      `Resources: ${overview?.resource_count || 0}`,
      `Providers: ${overview?.provider_count || 0}`,
      `Outputs: ${overview?.output_count || 0}`,
      `Plan: ${plan?.available ? `${plan.resources_add} add, ${plan.resources_change} change, ${plan.resources_destroy} destroy` : 'N/A'}`,
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
