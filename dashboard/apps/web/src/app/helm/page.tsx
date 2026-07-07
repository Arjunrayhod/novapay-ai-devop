import { QueryClientProvider } from '../providers/query-client';
import { HelmCenterPage } from '@/modules/helm/pages/helm-center-page';

export default function HelmPage() {
  return (
    <QueryClientProvider>
      <HelmCenterPage />
    </QueryClientProvider>
  );
}
