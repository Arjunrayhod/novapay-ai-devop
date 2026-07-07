'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useSecurity } from '../hooks/use-security';
import { SecurityOverviewCards } from '../components/security-overview-cards';
import { SecurityAIPanel } from '../components/security-ai-panel';
import { SecurityQuickActions } from '../components/security-quick-actions';
import { HealthPanel } from '../components/health-panel';
import { SastPanel } from '../components/sast-panel';
import { DependencyPanel } from '../components/dependency-panel';
import { CompliancePanel } from '../components/compliance-panel';

export function SecurityCenterPage() {
  const {
    health, overview, sast, dependencies, compliance,
    isLoading, refetch,
  } = useSecurity();

  return (
    <DashboardLayout activeItem="security">
      <PageContainer>
        <PageHeader
          title="Security Center"
          description="SAST scanning, dependency audit, vulnerability management, policy engine, and compliance reporting"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Security' }]}
        />

        <div className="mt-6 space-y-6">
          <SecurityOverviewCards overview={overview} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <SecurityAIPanel health={health} overview={overview} isLoading={isLoading} />
            </div>
            <div>
              <SecurityQuickActions
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={3} gap="lg">
            <HealthPanel health={health} isLoading={isLoading} />
            <SastPanel result={sast} isLoading={isLoading} />
            <DependencyPanel result={dependencies} isLoading={isLoading} />
          </Grid>

          <section>
            <SectionHeader title="Compliance & Governance" description="Policy evaluation and compliance scoring" className="mb-4" />
            <CompliancePanel report={compliance} isLoading={isLoading} />
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
