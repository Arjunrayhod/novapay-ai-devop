import { QueryClientProvider } from '../providers/query-client';
import { KubernetesCenterPage } from '@/modules/kubernetes/pages/kubernetes-center-page';

export default function KubernetesPage() {
  return (
    <QueryClientProvider>
      <KubernetesCenterPage />
    </QueryClientProvider>
  );
}
