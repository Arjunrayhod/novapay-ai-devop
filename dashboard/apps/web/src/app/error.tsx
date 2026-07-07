'use client';

import { DashboardLayout, PageContainer } from '@aegisai/ui';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DashboardLayout>
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertTriangle className="h-16 w-16 text-danger-500 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-300 mb-2">Something went wrong</h2>
          <p className="text-sm text-neutral-500 max-w-md mb-2">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-neutral-600 mb-4">Error ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
