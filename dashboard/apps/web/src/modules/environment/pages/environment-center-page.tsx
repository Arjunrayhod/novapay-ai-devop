'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useFullEnvironmentScan } from '../hooks/use-environment';
import { EnvironmentSummaryCard } from '../components/environment-summary-card';
import { SystemInfoCard } from '../components/system-info-card';
import { InstalledToolsTable } from '../components/installed-tools-table';
import { ValidationResults } from '../components/validation-results';
import { HealthScoreCard } from '../components/health-score-card';
import { RecommendationCard } from '../components/recommendation-card';
import { QuickActionsPanel } from '../components/quick-actions-panel';
import { useCallback, useRef } from 'react';

export function EnvironmentCenterPage() {
  const { system, tools, validation, health, isLoading, refetch } = useFullEnvironmentScan();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch('/api/environment/report');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `environment-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      const response = await fetch('/api/environment/report');
      const data = await response.json();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch {
      // silently fail
    }
  }, []);

  const handleScan = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <DashboardLayout activeItem="environment">
      <PageContainer>
        <div ref={reportRef}>
          <PageHeader
            title="Environment Center"
            description="System inspection and platform readiness verification"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Environment' }]}
          />

          <div className="mt-6 space-y-6">
            <Grid cols={4} gap="md">
              <div className="md:col-span-2">
                <EnvironmentSummaryCard system={system} isLoading={isLoading} />
              </div>
              <div>
                <HealthScoreCard health={health} isLoading={isLoading} />
              </div>
              <div>
                <QuickActionsPanel
                  onRefresh={refetch}
                  onExport={handleExport}
                  onCopy={handleCopy}
                  onScan={handleScan}
                  isRefreshing={isLoading}
                />
              </div>
            </Grid>

            <Grid cols={2} gap="lg">
              <SystemInfoCard system={system} isLoading={isLoading} />
              <RecommendationCard tools={tools} validation={validation} isLoading={isLoading} />
            </Grid>

            <section>
              <SectionHeader
                title="Installed Tools"
                description="Detected development and infrastructure tools"
                className="mb-4"
              />
              <InstalledToolsTable tools={tools} isLoading={isLoading} />
            </section>

            <section>
              <SectionHeader
                title="Validation Results"
                description="Platform readiness checks"
                className="mb-4"
              />
              <ValidationResults results={validation} isLoading={isLoading} />
            </section>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
