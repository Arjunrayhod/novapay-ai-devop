import { QueryClientProvider } from '../providers/query-client';
import { DevExperienceCenterPage } from '@/modules/dev-experience/pages/dev-experience-center-page';

export default function DevExperiencePage() {
  return (
    <QueryClientProvider>
      <DevExperienceCenterPage />
    </QueryClientProvider>
  );
}
