'use client';

import { DashboardLayout, PageContainer, PageHeader, SectionHeader, Grid } from '@aegisai/ui';
import { useKubernetesOverview, useDaemonSets, useStatefulSets, useIngresses } from '../hooks/use-kubernetes';
import { ClusterOverviewCards } from '../components/cluster-overview-cards';
import { KubernetesAIPanel } from '../components/kubernetes-ai-panel';
import { KubernetesQuickActions } from '../components/kubernetes-quick-actions';
import { HealthPanel } from '../components/health-panel';
import { MetricsPanel } from '../components/metrics-panel';
import { EventsPanel } from '../components/events-panel';
import { InfrastructureMap } from '../components/infrastructure-map';
import { NodesTable } from '../components/nodes-table';
import { NamespacesTable } from '../components/namespaces-table';
import { PodsTable } from '../components/pods-table';
import { DeploymentsTable } from '../components/deployments-table';
import { DaemonSetsTable } from '../components/daemonsets-table';
import { StatefulSetsTable } from '../components/statefulsets-table';
import { ServicesTable } from '../components/services-table';
import { IngressTable } from '../components/ingress-table';
import { StorageTable } from '../components/storage-table';

export function KubernetesCenterPage() {
  const {
    cluster, health, version, nodes, namespaces, pods, deployments,
    services, persistentVolumes, events, metrics,
    isLoading, refetch,
  } = useKubernetesOverview();
  const { data: daemonsets } = useDaemonSets();
  const { data: statefulsets } = useStatefulSets();
  const { data: ingress } = useIngresses();

  return (
    <DashboardLayout activeItem="kubernetes">
      <PageContainer>
        <PageHeader
          title="Kubernetes Control Center"
          description="Monitor and manage Kubernetes cluster, workloads, networking, and storage"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Kubernetes' }]}
        />

        <div className="mt-6 space-y-6">
          <ClusterOverviewCards cluster={cluster} health={health} isLoading={isLoading} />

          <Grid cols={4} gap="md">
            <div className="md:col-span-3">
              <KubernetesAIPanel health={health} metrics={metrics} nodes={nodes} isLoading={isLoading} />
            </div>
            <div>
              <KubernetesQuickActions
                cluster={cluster}
                health={health}
                version={version}
                nodes={nodes}
                pods={pods}
                deployments={deployments}
                onRefresh={refetch}
                isRefreshing={isLoading}
              />
            </div>
          </Grid>

          <Grid cols={3} gap="lg">
            <div>
              <HealthPanel health={health} isLoading={isLoading} />
            </div>
            <div>
              <MetricsPanel metrics={metrics} isLoading={isLoading} />
            </div>
            <div>
              <EventsPanel events={events} isLoading={isLoading} />
            </div>
          </Grid>

          <InfrastructureMap
            cluster={cluster}
            ingress={ingress}
            isLoading={isLoading}
          />

          <section>
            <SectionHeader title="Nodes" description="Cluster node inventory and status" className="mb-4" />
            <NodesTable nodes={nodes} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Namespaces" description="Kubernetes namespace isolation boundaries" className="mb-4" />
            <NamespacesTable namespaces={namespaces} isLoading={isLoading} />
          </section>

          <section>
            <SectionHeader title="Workloads" description="Pods, deployments, DaemonSets, and StatefulSets" className="mb-4" />
            <div className="space-y-4">
              <PodsTable pods={pods} isLoading={isLoading} />
              <DeploymentsTable deployments={deployments} isLoading={isLoading} />
              <Grid cols={2} gap="lg">
                <DaemonSetsTable daemonsets={daemonsets} isLoading={isLoading} />
                <StatefulSetsTable statefulsets={statefulsets} isLoading={isLoading} />
              </Grid>
            </div>
          </section>

          <section>
            <SectionHeader title="Networking" description="Services and Ingress resources" className="mb-4" />
            <Grid cols={2} gap="lg">
              <ServicesTable services={services} isLoading={isLoading} />
              <IngressTable ingress={ingress} isLoading={isLoading} />
            </Grid>
          </section>

          <section>
            <SectionHeader title="Storage" description="Persistent volumes and storage classes" className="mb-4" />
            <StorageTable persistentVolumes={persistentVolumes} isLoading={isLoading} />
          </section>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
