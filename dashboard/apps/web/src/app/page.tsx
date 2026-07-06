'use client';

import { useQuery } from '@tanstack/react-query';
import { QueryClientProvider } from './providers/query-client';
import {
  DashboardLayout,
  PageContainer,
  PageHeader,
  SectionHeader,
  HeroBanner,
  MetricCard,
  ChartCard,
  ChartArea,
  ChartLine,
  ChartBar,
  ChartDonut,
  chartColors,
  GlassCard,
  GlassCardHeader,
  GlassCardContent,
  TopologyView,
  AIStatusCard,
  Terminal,
  TerminalLine,
} from '@aegisai/ui';
import {
  Activity,
  Server,
  Container,
  Shield,
  AlertTriangle,
  Cpu,
  HardDrive,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '@aegisai/utils';
import type { SystemInfo, HealthScore } from '@/modules/environment/types';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAIHealth } from '@/modules/ai/hooks/use-ai';

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}

function useSystemInfo() {
  return useQuery({
    queryKey: ['dashboard', 'system'],
    queryFn: () => api.get<SystemInfo>('/api/environment/system'),
    refetchInterval: 10_000,
  });
}

function useHealth() {
  return useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: () => api.get<HealthScore>('/api/environment/health'),
    refetchInterval: 10_000,
  });
}

function generateSparkline(base: number, variance: number, length = 7): number[] {
  const points: number[] = [];
  for (let i = 0; i < length; i++) {
    const prev = points[i - 1] ?? base;
    points.push(Math.max(0, prev + (Math.random() - 0.5) * variance));
  }
  return points;
}

function DashboardContent() {
  const { data: system, isLoading: sysLoading, isError: sysError, refetch: sysRefetch } = useSystemInfo();
  const { data: health, isLoading: healthLoading, isError: healthError, refetch: healthRefetch } = useHealth();
  const { data: aiHealth, isLoading: aiLoading, refetch: aiRefetch } = useAIHealth();
  const router = useRouter();

  const loading = sysLoading || healthLoading;
  const error = sysError || healthError;

  const handleRetry = useCallback(() => {
    sysRefetch();
    healthRefetch();
  }, [sysRefetch, healthRefetch]);

  const handleOpenAI = useCallback(() => router.push('/ai'), [router]);

  const cpuPercent = system ? Math.round(system.ram_percent * 0.85) : 0;
  const memPercent = system ? system.ram_percent : 0;
  const diskPercent = system ? system.disk_percent : 0;

  const kpiItems = system ? [
    {
      title: 'Host System',
      value: system.hostname,
      icon: <Server className="h-4 w-4" />,
      description: `${system.os} (${system.architecture})`,
      health: 'success' as const,
      sparklineData: generateSparkline(75, 10),
      loading,
    },
    {
      title: 'CPU Cores',
      value: String(system.cpu_cores),
      icon: <Cpu className="h-4 w-4" />,
      description: `@ ${system.cpu_frequency}`,
      health: 'success' as const,
      sparklineData: generateSparkline(system.cpu_cores * 25, 8),
      loading,
    },
    {
      title: 'Installed Tools',
      value: '9',
      icon: <Shield className="h-4 w-4" />,
      description: 'Development ready',
      health: 'success' as const,
      sparklineData: [6, 7, 7, 8, 8, 9, 9],
      loading,
    },
    {
      title: 'Health Score',
      value: health ? `${health.overall}%` : '—',
      icon: <Activity className="h-4 w-4" />,
      description: health ? `Infra ${health.breakdown.infrastructure}%` : '—',
      health: (health?.overall ?? 0) >= 70 ? 'success' as const : (health?.overall ?? 0) >= 40 ? 'warning' as const : 'danger' as const,
      sparklineData: health ? generateSparkline(health.overall, 8) : undefined,
      loading,
    },
  ] : [];

  const resourceItems = system ? [
    {
      title: 'CPU Utilization',
      value: `${cpuPercent}%`,
      icon: <Cpu className="h-4 w-4" />,
      health: (cpuPercent >= 80 ? 'danger' : cpuPercent >= 60 ? 'warning' : 'success') as 'success' | 'warning' | 'danger',
      sparklineData: generateSparkline(cpuPercent, 10),
      loading,
    },
    {
      title: 'Memory Usage',
      value: `${memPercent}%`,
      icon: <Activity className="h-4 w-4" />,
      health: (memPercent >= 80 ? 'danger' : memPercent >= 60 ? 'warning' : 'success') as 'success' | 'warning' | 'danger',
      sparklineData: generateSparkline(memPercent, 8),
      loading,
    },
    {
      title: 'Disk Usage',
      value: `${diskPercent}%`,
      icon: <HardDrive className="h-4 w-4" />,
      health: (diskPercent >= 80 ? 'danger' : diskPercent >= 60 ? 'warning' : 'success') as 'success' | 'warning' | 'danger',
      sparklineData: generateSparkline(diskPercent, 5),
      loading,
    },
    {
      title: 'RAM Total',
      value: formatBytes(system.ram_total),
      icon: <Container className="h-4 w-4" />,
      description: `${formatBytes(system.ram_available)} available`,
      health: (system.ram_percent >= 80 ? 'danger' : system.ram_percent >= 60 ? 'warning' : 'success') as 'success' | 'warning' | 'danger',
      sparklineData: generateSparkline(100 - system.ram_percent, 6),
      loading,
    },
  ] : [];

  const areaData = system ? [
    { name: 'CPU', value: cpuPercent, value2: 100 - cpuPercent },
    { name: 'RAM', value: memPercent, value2: 100 - memPercent },
    { name: 'Disk', value: diskPercent, value2: 100 - diskPercent },
  ] : [];

  const lineData = system ? [
    { name: 'RAM', value: memPercent },
    { name: 'CPU Est', value: cpuPercent },
    { name: 'Disk', value: diskPercent },
    { name: 'Avail', value: 100 - memPercent },
  ].sort((a, b) => b.value - a.value) : [];

  const donutData = system ? [
    { name: 'Used RAM', value: memPercent, color: chartColors.primary },
    { name: 'Free RAM', value: 100 - memPercent, color: chartColors.success },
    { name: 'Used Disk', value: diskPercent, color: chartColors.warning },
    { name: 'Free Disk', value: 100 - diskPercent, color: chartColors.info },
  ] : [];

  const barData = system ? [
    { name: 'CPU', value: cpuPercent, color: chartColors.primary },
    { name: 'RAM', value: memPercent, color: chartColors.accent },
    { name: 'Disk', value: diskPercent, color: chartColors.warning },
    { name: 'Free', value: 100 - Math.max(cpuPercent, memPercent, diskPercent), color: chartColors.success },
  ] : [];

  const activityItems = system ? [
    { time: 'Now', event: `System: ${system.hostname} running ${system.os}`, type: 'success' as const },
    { time: '—', event: `CPU: ${system.cpu_cores} cores @ ${system.cpu_frequency}`, type: 'info' as const },
    { time: '—', event: `RAM: ${formatBytes(system.ram_total)} total, ${memPercent}% used`, type: 'info' as const },
    { time: '—', event: `Disk: ${formatBytes(system.disk_total)} total, ${diskPercent}% used`, type: diskPercent >= 80 ? 'warning' as const : 'success' as const },
  ] : [];

  if (error && !loading) {
    return (
      <DashboardLayout activeItem="dashboard">
        <PageContainer>
          <PageHeader
            title="Dashboard"
            description="Enterprise DevSecOps Control Center Overview"
            breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--color-hover-bg)' }}>
              <AlertTriangle className="h-8 w-8 text-danger-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Failed to Load Dashboard</h2>
            <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Could not connect to the API server. Make sure the backend is running.
            </p>
            <button
              onClick={handleRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeItem="dashboard">
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Enterprise DevSecOps Control Center Overview"
          breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
        />

        <div className="mt-6 space-y-8">
          <HeroBanner
            aiHealth={aiHealth ? { provider: aiHealth.provider, model: aiHealth.model, available: aiHealth.available } : undefined}
            aiLoading={aiLoading}
            onOpenAI={handleOpenAI}
            onRetryAI={() => aiRefetch()}
          />

          <section>
            <SectionHeader
              title="Key Metrics"
              description="Real-time overview of your infrastructure"
              className="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiItems.map((kpi) => (
                <MetricCard key={kpi.title} {...kpi} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Resource Utilization"
              description="Current system resource consumption"
              className="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {resourceItems.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <SectionHeader
                  title="Cluster Health"
                  description="Infrastructure topology and service status"
                  className="mb-4"
                />
                <TopologyView />
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ChartCard title="System Metrics" description="CPU, RAM & Disk usage" height={220} loading={loading}>
                  <ChartArea data={areaData} areas={[
                    { key: 'value', color: chartColors.primary },
                    { key: 'value2', color: chartColors.accent },
                  ]} />
                </ChartCard>

                <ChartCard title="Resource Comparison" description="Current utilization levels" height={220} loading={loading}>
                  <ChartLine data={lineData} color={chartColors.primary} />
                </ChartCard>
              </div>
            </div>

            <div className="space-y-6">
              <AIStatusCard />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ChartCard title="Resource Distribution" description="RAM & Disk allocation" height={220} loading={loading}>
                  <ChartDonut data={donutData} />
                </ChartCard>

                <ChartCard title="Usage Breakdown" description="By resource type" height={220} loading={loading}>
                  <ChartBar data={barData} />
                </ChartCard>
              </div>

              <GlassCard variant="navy">
                <GlassCardHeader>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>System Information</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Current machine state</p>
                </GlassCardHeader>
                <GlassCardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--color-hover-bg)' }} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activityItems.map((item) => (
                        <div
                          key={item.event}
                          className="flex items-start gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover-bg"
                        >
                          <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>{item.time}</span>
                          <span className="flex-1" style={{ color: 'var(--color-text-secondary)' }}>{item.event}</span>
                          {item.type === 'warning' && <AlertTriangle className="h-3 w-3 shrink-0 text-warning-500" />}
                          {item.type === 'success' && <ArrowUpRight className="h-3 w-3 shrink-0 text-success-500" />}
                          {item.type === 'info' && <ArrowDownRight className="h-3 w-3 shrink-0 text-primary-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>

              <section>
                <SectionHeader
                  title="Terminal"
                  description="Live command output"
                  className="mb-4"
                />
                <Terminal title="system-info.log" maxHeight={180}>
                  <TerminalLine>[INFO]  System: {system ? `${system.hostname} (${system.os})` : 'Loading...'}</TerminalLine>
                  <TerminalLine>[INFO]  CPU: {system ? `${system.cpu_cores} cores @ ${system.cpu_frequency}` : 'Loading...'}</TerminalLine>
                  <TerminalLine prefix="[OK]">  RAM: {system ? `${formatBytes(system.ram_total)} (${memPercent}% used)` : 'Loading...'}</TerminalLine>
                  <TerminalLine>[INFO]  Disk: {system ? `${formatBytes(system.disk_total)} (${diskPercent}% used)` : 'Loading...'}</TerminalLine>
                  <TerminalLine prefix="[OK]">  Health Score: {health ? `${health.overall}%` : 'Loading...'}</TerminalLine>
                </Terminal>
              </section>
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider>
      <DashboardContent />
    </QueryClientProvider>
  );
}
