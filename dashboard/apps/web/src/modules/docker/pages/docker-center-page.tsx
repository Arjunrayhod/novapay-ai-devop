'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useDockerOverview, useEvents } from '../hooks/use-docker';
import { DockerDashboardCards } from '../components/docker-dashboard-cards';
import { ContainersTable } from '../components/containers-table';
import { ImagesTable } from '../components/images-table';
import { NetworksTable } from '../components/networks-table';
import { VolumesTable } from '../components/volumes-table';
import { LiveResourceUsage } from '../components/live-resource-usage';
import { DockerEventStream } from '../components/docker-event-stream';
import { DockerAIPanel } from '../components/docker-ai-panel';
import { DockerQuickActions } from '../components/docker-quick-actions';

export function DockerCenterPage() {
  const { info, containers, images, networks, volumes, version, stats, isLoading, refetch } = useDockerOverview();
  const events = useEvents();

  return (
    <DashboardLayout activeItem="docker">
      <PageContainer>
        <PageHeader
          title="Docker Control Center"
          description="Monitor and manage Docker engine, containers, images, networks, and volumes"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Docker' }]}
        />

        <div className="mt-6 space-y-6">
          <DockerDashboardCards info={info} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <DockerAIPanel info={info} stats={stats} images={images} isLoading={isLoading} />
            </div>
            <div>
              <DockerQuickActions
                info={info}
                containers={containers}
                images={images}
                networks={networks}
                volumes={volumes}
                version={version}
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={3} gap="lg">
            <div className="md:col-span-2">
              <LiveResourceUsage stats={stats} isLoading={isLoading} />
            </div>
            <div>
              <DockerEventStream events={events} />
            </div>
          </Grid>

          <section>
            <SectionHeader
              title="Containers"
              description="All Docker containers on this host"
              className="mb-4"
            />
            <ContainersTable containers={containers} isLoading={isLoading} />
          </section>

          <Grid cols={2} gap="lg">
            <ImagesTable images={images} isLoading={isLoading} />
            <NetworksTable networks={networks} isLoading={isLoading} />
          </Grid>

          <section>
            <SectionHeader
              title="Volumes"
              description="Persistent data volumes"
              className="mb-4"
            />
            <VolumesTable volumes={volumes} isLoading={isLoading} />
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
