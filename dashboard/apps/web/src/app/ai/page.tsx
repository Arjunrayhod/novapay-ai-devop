import { QueryClientProvider } from '../providers/query-client';
import { AICenterPage } from '@/modules/ai/pages/ai-center-page';

export default function AIPage() {
  return (
    <QueryClientProvider>
      <AICenterPage />
    </QueryClientProvider>
  );
}
