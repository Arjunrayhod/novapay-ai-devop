'use client';

import { DashboardLayout, PageContainer, PageHeader, Grid, SectionHeader } from '@aegisai/ui';
import { RefreshCw, Download, Copy } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useDevExperience } from '../hooks/use-dev-experience';
import { SystemSummaryCard } from '../components/system-summary-card';
import { ReadinessScoreCard } from '../components/readiness-score-card';
import { PathValidationPanel } from '../components/path-validation-panel';
import { InstallCommandsPanel } from '../components/install-commands-panel';
import { AISuggestionsPanel } from '../components/ai-suggestions-panel';

export function DevExperienceCenterPage() {
  const {
    scan, pathValidation, installCommands, suggestions,
    isLoading, refetch,
  } = useDevExperience();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch('/api/dev-experience/report');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnostic-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }, []);

  const handleCopyReport = useCallback(async () => {
    try {
      const response = await fetch('/api/dev-experience/report');
      const data = await response.json();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch {
      // silently fail
    }
  }, []);

  return (
    <DashboardLayout activeItem="dev-experience">
      <PageContainer>
        <div ref={reportRef}>
          <PageHeader
            title="Developer Experience"
            description="System onboarding, setup guidance, and diagnostic tools"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Developer Experience' }]}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Report
                </button>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Report
                </button>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Scanning...' : 'Run Scan'}
                </button>
              </div>
            }
          />

          <div className="mt-6 space-y-6">
            <Grid cols={3} gap="md">
              <div className="md:col-span-2">
                <SystemSummaryCard
                  system={scan?.system}
                  tools={scan?.tools}
                  isLoading={isLoading}
                />
              </div>
              <div>
                <ReadinessScoreCard
                  summary={suggestions && scan ? {
                    overall: Math.round(
                      ((scan.tools.filter(t => t.installed).length) / Math.max(scan.tools.length, 1)) * 100
                    ),
                    tools_installed: scan.tools.filter(t => t.installed).length,
                    tools_missing: scan.tools.filter(t => !t.installed).length,
                    total_tools: scan.tools.length,
                    path_issues: pathValidation?.summary.missing ?? 0 + (pathValidation?.summary.inaccessible ?? 0),
                    critical_issues: suggestions?.suggestions.filter(s => s.severity === 'critical').length ?? 0,
                  } : undefined}
                  isLoading={isLoading}
                />
              </div>
            </Grid>

            <Grid cols={2} gap="lg">
              <AISuggestionsPanel
                suggestions={suggestions?.suggestions}
                isLoading={isLoading}
              />
              <InstallCommandsPanel
                commands={installCommands?.commands}
                missingTools={installCommands?.missing_tools}
                isLoading={isLoading}
              />
            </Grid>

            <section>
              <SectionHeader
                title="PATH Validation"
                description="Environment variable PATH entries classified by status"
                className="mb-4"
              />
              <PathValidationPanel
                result={pathValidation}
                isLoading={isLoading}
              />
            </section>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
