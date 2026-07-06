'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader } from '@aegisai/ui';
import { useAI } from '../hooks/use-ai';
import { AIOverviewCards } from '../components/ai-overview-cards';
import { AIChat } from '../components/ai-chat';

export function AICenterPage() {
  const {
    health, overview, insights, recommendations,
    isLoading,
  } = useAI();

  return (
    <DashboardLayout activeItem="ai-assistant">
      <PageContainer>
        <PageHeader
          title="AI Center"
          description="Enterprise AI Copilot for platform intelligence"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'AI Center' }]}
        />

        <div className="mt-6 space-y-6">
          <AIOverviewCards
            health={health}
            overview={overview}
            insights={insights}
            recommendations={recommendations}
            isLoading={isLoading}
          />

          <section>
            <SectionHeader
              title="AI Assistant"
              description="Ask questions about your infrastructure, security, and platform health"
              className="mb-4"
            />
            <AIChat />
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
