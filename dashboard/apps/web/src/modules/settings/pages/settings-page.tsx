'use client';

import { DashboardLayout, PageContainer, PageHeader } from '@aegisai/ui';
import { Settings } from 'lucide-react';
import { GitHubIntegrationCard } from '../components/github-integration-card';

export function SettingsPage() {
  return (
    <DashboardLayout activeItem="settings">
      <PageContainer>
        <PageHeader
          title="Settings"
          description="Platform configuration, user preferences, and system settings"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
        />

        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <Settings className="h-4 w-4" />
              Integrations
            </h2>
            <GitHubIntegrationCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
