'use client';

import * as React from 'react';
import {
  DashboardLayout,
  PageContainer,
  PageHeader,
  SectionHeader,
  IntegrationCard,
  GlassCard,
  type IntegrationCardIntegration,
} from '@aegisai/ui';
import {
  fetchIntegrations,
  connectIntegration,
  disconnectIntegration,
  testIntegration,
  syncIntegration,
} from '../services/integrations-api';

const CATEGORY_ORDER = [
  'Source Control',
  'Cloud',
  'Containers',
  'Observability',
  'AI Providers',
  'Notifications',
];

export function IntegrationsCenterPage() {
  const [data, setData] = React.useState<{
    integrations: IntegrationCardIntegration[];
    wsReadiness: { total: number; connected: number; score: number } | null;
  }>({ integrations: [], wsReadiness: null });
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const res = await fetchIntegrations();
      setData({
        integrations: res.integrations,
        wsReadiness: res.workspace_readiness,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleConnect = React.useCallback(
    async (providerId: string, credentials: Record<string, string>) => {
      await connectIntegration(providerId, credentials);
      await load();
    },
    [load],
  );

  const handleDisconnect = React.useCallback(
    async (providerId: string) => {
      await disconnectIntegration(providerId);
      await load();
    },
    [load],
  );

  const handleTest = React.useCallback(
    async (providerId: string) => {
      const detail = data.integrations.find((i) => i.provider.id === providerId);
      const creds: Record<string, string> = {};
      if (detail) {
        for (const f of detail.config_fields) {
          creds[f.key] = '';
        }
      }
      const result = await testIntegration(providerId, creds);
      return { success: result.success, message: result.message };
    },
    [data.integrations],
  );

  const handleRefresh = React.useCallback(
    async (providerId: string) => {
      await syncIntegration(providerId);
      await load();
    },
    [load],
  );

  const grouped = React.useMemo(() => {
    const map: Record<string, IntegrationCardIntegration[]> = {};
    for (const int of data.integrations) {
      const cat = int.provider.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(int);
    }
    const ordered: Array<{ category: string; items: IntegrationCardIntegration[] }> = [];
    for (const cat of CATEGORY_ORDER) {
      if (map[cat]) {
        ordered.push({ category: cat, items: map[cat] });
      }
    }
    for (const cat of Object.keys(map)) {
      if (!CATEGORY_ORDER.includes(cat)) {
        ordered.push({ category: cat, items: map[cat] });
      }
    }
    return ordered;
  }, [data.integrations]);

  const readiness = data.wsReadiness;

  return (
    <DashboardLayout activeItem="integrations">
      <PageContainer>
        <PageHeader
          title="Integrations Center"
          description="Connect and manage all external platforms"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Integrations' }]}
        />

        <div className="mb-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Workspace Readiness
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {readiness
                    ? `${readiness.connected} of ${readiness.total} integrations connected`
                    : 'Loading...'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-500">
                    {readiness ? `${readiness.score}%` : '—'}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">Ready</div>
                </div>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="var(--color-border-light)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${(readiness?.score ?? 0) * 0.31} 100`}
                      className="text-primary-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--color-text-primary)]">
                    {readiness ? `${Math.round(readiness.score)}%` : '?'}
                  </span>
                </div>
              </div>
            </div>
            {readiness && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {readiness.integrations.map((s) => (
                  <div key={s.provider} className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-[var(--color-surface-muted)]">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        s.connected ? 'bg-success-500' : 'bg-neutral-500',
                      )}
                    />
                    <span className="capitalize truncate text-[var(--color-text-secondary)]">
                      {s.provider.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ category, items }) => (
              <section key={category}>
                <SectionHeader title={category} />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((int) => (
                    <IntegrationCard
                      key={int.provider.id}
                      integration={int}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onTest={handleTest}
                      onRefresh={handleRefresh}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
