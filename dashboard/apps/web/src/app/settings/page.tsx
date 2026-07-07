import { QueryClientProvider } from '../providers/query-client';
import { SettingsPage as SettingsClientPage } from '@/modules/settings/pages/settings-page';

export default function SettingsPage() {
  return (
    <QueryClientProvider>
      <SettingsClientPage />
    </QueryClientProvider>
  );
}
