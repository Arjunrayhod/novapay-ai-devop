import { QueryClientProvider } from '../providers/query-client';
import { TerraformCenterPage } from '@/modules/terraform/pages/terraform-center-page';

export default function TerraformPage() {
  return (
    <QueryClientProvider>
      <TerraformCenterPage />
    </QueryClientProvider>
  );
}
