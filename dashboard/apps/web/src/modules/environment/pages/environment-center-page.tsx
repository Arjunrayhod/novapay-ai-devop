'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid, SystemConsentDialog, getSystemConsent, setSystemConsent } from '@aegisai/ui';
import { useFullEnvironmentScan } from '../hooks/use-environment';
import { EnvironmentSummaryCard } from '../components/environment-summary-card';
import { SystemInfoCard } from '../components/system-info-card';
import { InstalledToolsTable } from '../components/installed-tools-table';
import { ValidationResults } from '../components/validation-results';
import { HealthScoreCard } from '../components/health-score-card';
import { RecommendationCard } from '../components/recommendation-card';
import { QuickActionsPanel } from '../components/quick-actions-panel';
import { fetchReport } from '../services/environment-api';
import { Shield } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function EnvironmentCenterPage() {
  const [consent, setConsent] = useState<'pending' | 'allowed' | 'denied'>('pending');

  useEffect(() => {
    const saved = getSystemConsent();
    if (saved === true) setConsent('allowed');
    else if (saved === false) setConsent('denied');
  }, []);
  const { system, tools, validation, health, isLoading, refetch } = useFullEnvironmentScan(consent === 'allowed');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleAllow = useCallback(() => {
    setSystemConsent(true);
    setConsent('allowed');
  }, []);

  const handleDeny = useCallback(() => {
    setSystemConsent(false);
    setConsent('denied');
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const data = await fetchReport();
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
      const data = await fetchReport();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch {
      // silently fail
    }
  }, []);

  const handleScan = useCallback(() => {
    refetch();
  }, [refetch]);

  if (consent === 'pending') {
    return <SystemConsentDialog onAllow={handleAllow} onDeny={handleDeny} />;
  }

  if (consent === 'denied') {
    return (
      <DashboardLayout activeItem="environment">
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--color-hover-bg)' }}>
              <Shield className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>System Access Denied</h2>
            <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              You denied system information access. The Environment Center cannot show your system data.
              To re-enable, clear your browser data for this site or click below.
            </p>
            <button
              onClick={handleAllow}
              className="mt-6 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            >
              Enable Access
            </button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

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
