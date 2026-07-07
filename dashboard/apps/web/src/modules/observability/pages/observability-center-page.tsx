'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useObservability } from '../hooks/use-observability';
import { ObservabilityOverviewCards } from '../components/observability-overview-cards';
import { ObservabilityAIPanel } from '../components/observability-ai-panel';
import { ObservabilityQuickActions } from '../components/observability-quick-actions';
import { HealthPanel } from '../components/health-panel';
import { MetricsPanel } from '../components/metrics-panel';
import { LogsViewer } from '../components/logs-viewer';
import { TraceViewer } from '../components/trace-viewer';
import { AlertFeed } from '../components/alert-feed';
import { TargetHealthPanel } from '../components/target-health-panel';
import { DatasourceHealthPanel } from '../components/datasource-health-panel';

export function ObservabilityCenterPage() {
  const {
    health, overview, targets, alerts, services, dashboards,
    isLoading, refetch,
  } = useObservability();

  return (
    <DashboardLayout activeItem="observability">
      <PageContainer>
        <PageHeader
          title="Observability Control Center"
          description="Monitor Prometheus, Grafana, Loki, Tempo, and OpenTelemetry"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Observability' }]}
        />

        <div className="mt-6 space-y-6">
          <ObservabilityOverviewCards overview={overview} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <ObservabilityAIPanel health={health} overview={overview} alerts={alerts} isLoading={isLoading} />
            </div>
            <div>
              <ObservabilityQuickActions
                health={health}
                overview={overview}
                alerts={alerts}
                targets={targets}
                services={services}
                dashboards={dashboards}
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={3} gap="lg">
            <HealthPanel health={health} isLoading={isLoading} />
            <AlertFeed />
            <TargetHealthPanel />
          </Grid>

          <section>
            <SectionHeader title="Live Metrics & Logs" description="Prometheus metrics and Loki logs" className="mb-4" />
            <Grid cols={2} gap="lg">
              <MetricsPanel />
              <LogsViewer />
            </Grid>
          </section>

          <section>
            <SectionHeader title="Distributed Tracing" description="Tempo trace timeline and service map" className="mb-4" />
            <TraceViewer />
          </section>

          <section>
            <SectionHeader title="Grafana" description="Datasource configuration" className="mb-4" />
            <DatasourceHealthPanel />
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
