'use client';

import {
  DashboardLayout,
  PageContainer,
  Grid,
  PageHeader,
  SectionHeader,
  MetricCard,
  ChartCard,
  GlassCard,
  GlassCardHeader,
  GlassCardContent,
  InfrastructurePlaceholder,
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
  GitPullRequest,
  Cpu,
  HardDrive,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const kpiData = [
  { title: 'Active Clusters', value: '12', trend: 'up' as const, trendValue: '+2', icon: <Server className="h-4 w-4" />, description: 'Across 3 regions' },
  { title: 'Running Pods', value: '847', trend: 'up' as const, trendValue: '+23', icon: <Container className="h-4 w-4" />, description: '99.7% uptime' },
  { title: 'Security Alerts', value: '3', trend: 'down' as const, trendValue: '-12', icon: <Shield className="h-4 w-4" />, description: '2 critical, 1 warning' },
  { title: 'Deployments', value: '156', trend: 'up' as const, trendValue: '+8', icon: <GitPullRequest className="h-4 w-4" />, description: 'Today' },
];

const resourceMetrics = [
  { title: 'CPU Utilization', value: '64%', trend: 'up' as const, trendValue: '+5%', icon: <Cpu className="h-4 w-4" /> },
  { title: 'Memory Usage', value: '72%', trend: 'up' as const, trendValue: '+3%', icon: <HardDrive className="h-4 w-4" /> },
  { title: 'Error Rate', value: '0.12%', trend: 'down' as const, trendValue: '-0.04%', icon: <AlertTriangle className="h-4 w-4" /> },
  { title: 'Request Rate', value: '2.4k/s', trend: 'up' as const, trendValue: '+12%', icon: <Activity className="h-4 w-4" /> },
];

export default function DashboardPage() {
  return (
    <DashboardLayout activeItem="dashboard">
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Enterprise DevSecOps Control Center Overview"
          breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
        />

        <div className="mt-6 space-y-8">
          <section>
            <SectionHeader
              title="Key Metrics"
              description="Real-time overview of your infrastructure"
              className="mb-4"
            />
            <Grid cols={4} gap="md">
              {kpiData.map((kpi) => (
                <MetricCard key={kpi.title} {...kpi} />
              ))}
            </Grid>
          </section>

          <section>
            <SectionHeader
              title="Resource Utilization"
              description="Cluster-wide resource consumption"
              className="mb-4"
            />
            <Grid cols={4} gap="md">
              {resourceMetrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </Grid>
          </section>

          <Grid cols={2} gap="lg">
            <div className="space-y-6">
              <section>
                <SectionHeader
                  title="Cluster Health"
                  description="Infrastructure topology and service status"
                  className="mb-4"
                />
                <InfrastructurePlaceholder />
              </section>

              <section>
                <ChartCard title="System Metrics" description="CPU, Memory, Network I/O" height={240}>
                  <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <Activity className="h-8 w-8" />
                      <span className="text-sm">Metrics visualization loading...</span>
                    </div>
                  </div>
                </ChartCard>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <SectionHeader
                  title="AI Operations"
                  description="Intelligent monitoring and insights"
                  className="mb-4"
                />
                <AIStatusCard />
              </section>

              <section>
                <GlassCard>
                  <GlassCardHeader>
                    <h3 className="text-sm font-semibold">Recent Activity</h3>
                    <p className="text-xs text-neutral-500">Latest platform events</p>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <div className="space-y-1">
                      {[
                        { time: '2m ago', event: 'Deployment prod-api v3.2.1 rolled out', type: 'success' },
                        { time: '15m ago', event: 'Auto-scaled cluster-eu-1 from 4 to 6 nodes', type: 'info' },
                        { time: '1h ago', event: 'Vault policy rotation completed', type: 'success' },
                        { time: '2h ago', event: 'Security scan found 3 vulnerabilities', type: 'warning' },
                      ].map((item) => (
                        <div key={item.time} className="flex items-start gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <span className="shrink-0 text-neutral-400">{item.time}</span>
                          <span className="flex-1 text-neutral-700 dark:text-neutral-300">{item.event}</span>
                          {item.type === 'warning' && <AlertTriangle className="h-3 w-3 shrink-0 text-warning-500" />}
                          {item.type === 'success' && <ArrowUpRight className="h-3 w-3 shrink-0 text-success-500" />}
                          {item.type === 'info' && <ArrowDownRight className="h-3 w-3 shrink-0 text-primary-500" />}
                        </div>
                      ))}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </section>

              <section>
                <SectionHeader
                  title="Terminal"
                  description="Live command output"
                  className="mb-4"
                />
                <Terminal title="deploy.log" maxHeight={180}>
                  <TerminalLine>[INFO]  Starting deployment pipeline...</TerminalLine>
                  <TerminalLine>[INFO]  Building image: novapay/api:3.2.1</TerminalLine>
                  <TerminalLine prefix="[OK]">  Image built successfully (12.4s)</TerminalLine>
                  <TerminalLine>[INFO]  Pushing to registry...</TerminalLine>
                  <TerminalLine prefix="[OK]">  Deployment completed</TerminalLine>
                </Terminal>
              </section>
            </div>
          </Grid>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
