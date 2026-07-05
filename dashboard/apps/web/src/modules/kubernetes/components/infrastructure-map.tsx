'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@aegisai/ui';
import { Server, Globe, Container, Layers, ArrowDown } from 'lucide-react';
import type { ClusterInfo, IngressInfo } from '../types';

interface InfrastructureMapProps {
  cluster?: ClusterInfo;
  ingress?: IngressInfo[];
  isLoading?: boolean;
}

export function InfrastructureMap({ cluster, ingress, isLoading }: InfrastructureMapProps) {
  if (isLoading || !cluster) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Infrastructure Map</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  const tier = (icon: React.ReactNode, label: string, count: number | string, subline?: string) => (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface p-3 text-center transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
      <div className="text-primary-500">{icon}</div>
      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-50">{label}</span>
      <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{count}</span>
      {subline && <span className="text-[10px] text-neutral-400">{subline}</span>}
    </div>
  );

  const connector = () => (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Infrastructure Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {tier(<Server className="h-5 w-5" />, 'Cluster', cluster.version?.git_version?.split('/')?.[0]?.replace(/^v/, '') || '—', `${cluster.nodes_total} nodes`)}

          <div className="flex flex-col justify-center">
            {connector()}
          </div>

          {tier(<Server className="h-5 w-5" />, 'Nodes', cluster.nodes_total, `${cluster.nodes_ready} ready`)}

          <div className="flex flex-col justify-center">
            {connector()}
          </div>

          {tier(<Globe className="h-5 w-5" />, 'Namespaces', cluster.namespaces)}

          <div className="flex flex-col justify-center">
            {connector()}
          </div>

          {tier(<Container className="h-5 w-5" />, 'Pods', cluster.pods_total, `${cluster.pods_running} running`)}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {tier(<Layers className="h-5 w-5" />, 'Services', cluster.services)}
          {tier(<Globe className="h-5 w-5" />, 'Ingress', ingress?.length || 0)}
        </div>

        {/* Future: Interactive topology with React Flow — click any node to drill down */}
      </CardContent>
    </Card>
  );
}
