'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useTerraformOverview } from '../hooks/use-terraform';
import { TerraformOverviewCards } from '../components/terraform-overview-cards';
import { TerraformAIPanel } from '../components/terraform-ai-panel';
import { TerraformQuickActions } from '../components/terraform-quick-actions';
import { HealthPanel } from '../components/health-panel';
import { StateViewer } from '../components/state-viewer';
import { PlanViewer } from '../components/plan-viewer';
import { ModulesTable } from '../components/modules-table';
import { ResourcesTable } from '../components/resources-table';
import { ProvidersTable } from '../components/providers-table';
import { OutputViewer } from '../components/output-viewer';

export function TerraformCenterPage() {
  const {
    overview, health, version, state, modules, resources, providers, outputs, plan,
    isLoading, refetch,
  } = useTerraformOverview();

  return (
    <DashboardLayout activeItem="terraform">
      <PageContainer>
        <PageHeader
          title="Terraform Control Center"
          description="Monitor Terraform version, state, modules, resources, providers, and plans"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terraform' }]}
        />

        <div className="mt-6 space-y-6">
          <TerraformOverviewCards overview={overview} health={health} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <TerraformAIPanel health={health} overview={overview} modules={modules} providers={providers} isLoading={isLoading} />
            </div>
            <div>
              <TerraformQuickActions
                overview={overview}
                health={health}
                version={version}
                state={state}
                modules={modules}
                resources={resources}
                providers={providers}
                outputs={outputs}
                plan={plan}
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={3} gap="lg">
            <HealthPanel health={health} isLoading={isLoading} />
            <StateViewer state={state} isLoading={isLoading} />
            <PlanViewer plan={plan} isLoading={isLoading} />
          </Grid>

          <section>
            <SectionHeader title="Modules" description="Terraform modules in configuration" className="mb-4" />
            <ModulesTable modules={modules} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Resources" description="All managed and data resources" className="mb-4" />
            <ResourcesTable resources={resources} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Providers & Outputs" description="Configured providers and outputs" className="mb-4" />
            <Grid cols={2} gap="lg">
              <ProvidersTable providers={providers} isLoading={isLoading} />
              <OutputViewer outputs={outputs} isLoading={isLoading} />
            </Grid>
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
