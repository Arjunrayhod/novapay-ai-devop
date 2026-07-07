import { QueryClientProvider } from '../providers/query-client';
import { EnvironmentCenterPage } from '@/modules/environment/pages/environment-center-page';

export default function EnvironmentPage() {
  return (
    <QueryClientProvider>
      <EnvironmentCenterPage />
    </QueryClientProvider>
  );
}
