import { QueryClientProvider } from '../providers/query-client';
import { DockerCenterPage } from '@/modules/docker/pages/docker-center-page';

export default function DockerPage() {
  return (
    <QueryClientProvider>
      <DockerCenterPage />
    </QueryClientProvider>
  );
}
