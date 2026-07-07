import { QueryClientProvider } from '../providers/query-client';
import { ObservabilityCenterPage } from '@/modules/observability/pages/observability-center-page';

export default function ObservabilityPage() {
  return (
    <QueryClientProvider>
      <ObservabilityCenterPage />
    </QueryClientProvider>
  );
}
