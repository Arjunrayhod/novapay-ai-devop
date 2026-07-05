import { QueryClientProvider } from '../providers/query-client';
import { SecurityCenterPage } from '@/modules/security/pages/security-center-page';

export default function SecurityPage() {
  return (
    <QueryClientProvider>
      <SecurityCenterPage />
    </QueryClientProvider>
  );
}
