'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useHelmOverview } from '../hooks/use-helm';
import { HelmOverviewCards } from '../components/helm-overview-cards';
import { HelmAIPanel } from '../components/helm-ai-panel';
import { HelmQuickActions } from '../components/helm-quick-actions';
import { HealthPanel } from '../components/health-panel';
import { ReleasesTable } from '../components/releases-table';
import { RepositoriesTable } from '../components/repositories-table';
import { DependenciesTable } from '../components/dependencies-table';
import { HistoryTable } from '../components/history-table';
import { ValuesViewer } from '../components/values-viewer';

export function HelmCenterPage() {
  const {
    overview, health, version, releases, repositories, charts,
    isLoading, refetch,
  } = useHelmOverview();

  return (
    <DashboardLayout activeItem="helm">
      <PageContainer>
        <PageHeader
          title="Helm Control Center"
          description="Monitor Helm releases, charts, repositories, and configurations"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Helm' }]}
        />

        <div className="mt-6 space-y-6">
          <HelmOverviewCards overview={overview} health={health} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <HelmAIPanel health={health} overview={overview} isLoading={isLoading} />
            </div>
            <div>
              <HelmQuickActions
                overview={overview}
                health={health}
                version={version}
                releases={releases}
                repositories={repositories}
                charts={charts}
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={2} gap="lg">
            <div>
              <HealthPanel health={health} isLoading={isLoading} />
            </div>
            <div>
              <ValuesViewer isLoading={isLoading} />
            </div>
          </Grid>

          <section>
            <SectionHeader title="Releases" description="All Helm releases across namespaces" className="mb-4" />
            <ReleasesTable releases={releases} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Repositories" description="Helm chart repositories" className="mb-4" />
            <RepositoriesTable repositories={repositories} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Charts & Dependencies" description="Available charts and their dependencies" className="mb-4" />
            <Grid cols={2} gap="lg">
              <DependenciesTable isLoading={isLoading} />
              <HistoryTable isLoading={isLoading} />
            </Grid>
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
