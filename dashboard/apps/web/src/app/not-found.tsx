'use client';

import { DashboardLayout, PageContainer } from '@aegisai/ui';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <DashboardLayout>
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileQuestion className="h-16 w-16 text-neutral-600 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-300 mb-2">Page Not Found</h2>
          <p className="text-sm text-neutral-500 max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been implemented yet.
          </p>
          <a
            href="/"
            className="mt-6 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
