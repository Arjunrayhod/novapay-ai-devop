import { QueryClientProvider } from '../providers/query-client';
import { GitHubPage as GitHubClientPage } from '@/modules/github/pages/github-page';

export default function GitHubPage() {
  return (
    <QueryClientProvider>
      <GitHubClientPage />
    </QueryClientProvider>
  );
}
