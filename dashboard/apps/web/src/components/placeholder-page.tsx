'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryClientProvider } from '@/app/providers/query-client';
import { DashboardLayout, PageContainer, PageHeader, GlassCard, GlassCardHeader, GlassCardContent, MetricCard } from '@aegisai/ui';
import { Cpu, HardDrive, Server, Activity, RefreshCw, AlertTriangle, Wrench } from 'lucide-react';
import { api } from '@aegisai/utils';
import { useCallback } from 'react';
import type { SystemInfo } from '@/modules/environment/types';

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

interface PlaceholderPageProps {
  title: string;
  description: string;
  module: string;
}

function PlaceholderContent({ title, description, module }: PlaceholderPageProps) {
  const { data: system, isLoading, isError, refetch } = useQuery({
    queryKey: [module, 'system'],
    queryFn: () => api.get<SystemInfo>('/api/environment/system'),
    refetchInterval: 10_000,
  });

  const handleRetry = useCallback(() => { refetch(); }, [refetch]);

  if (isError && !isLoading) {
    return (
      <DashboardLayout activeItem={module}>
        <PageContainer>
          <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Home', href: '/' }, { label: title }]} />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertTriangle className="h-12 w-12 text-danger-400 mb-4" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Failed to Load</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Could not connect to the API server.</p>
            <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90" style={{ backgroundColor: 'var(--color-primary-500)' }}>
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem={module}>
      <PageContainer>
        <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Home', href: '/' }, { label: title }]} />

        <div className="mt-6 space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" style={{ color: 'var(--color-primary-500)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Coming Soon</h3>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                The <strong style={{ color: 'var(--color-text-primary)' }}>{title}</strong> module is under development. A dedicated API endpoint will be available in a future release.
              </p>
            </GlassCardContent>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Operating System"
              value={isLoading ? '—' : (system?.os ?? '—')}
              icon={<Server className="h-4 w-4" />}
              description={system?.architecture}
              loading={isLoading}
            />
            <MetricCard
              title="CPU Cores"
              value={isLoading ? '—' : String(system?.cpu_cores ?? '—')}
              icon={<Cpu className="h-4 w-4" />}
              description={system?.cpu_frequency}
              loading={isLoading}
            />
            <MetricCard
              title="Memory"
              value={isLoading ? '—' : (system ? formatBytes(system.ram_total) : '—')}
              icon={<HardDrive className="h-4 w-4" />}
              description={system ? `${system.ram_percent}% used` : '—'}
              loading={isLoading}
            />
            <MetricCard
              title="Disk"
              value={isLoading ? '—' : (system ? formatBytes(system.disk_total) : '—')}
              icon={<Activity className="h-4 w-4" />}
              description={system ? `${system.disk_percent}% used` : '—'}
              loading={isLoading}
            />
          </div>

          <GlassCard>
            <GlassCardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wrench className="h-12 w-12 mb-4" style={{ color: 'var(--color-text-muted)' }} />
                <h4 className="text-base font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{title} Module</h4>
                <p className="text-sm max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
                  {description}
                </p>
                <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
                  Backend API endpoint at <code style={{ color: 'var(--color-primary-500)' }}>/api/{module}</code> is not yet implemented
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}

export function PlaceholderPage({ title, description, module }: PlaceholderPageProps) {
  return (
    <QueryClientProvider>
      <PlaceholderContent title={title} description={description} module={module} />
    </QueryClientProvider>
  );
}
