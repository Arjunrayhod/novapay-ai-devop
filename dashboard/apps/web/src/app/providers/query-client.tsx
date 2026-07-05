'use client';

import { QueryClient, QueryClientProvider as TanStackProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return <TanStackProvider client={queryClient}>{children}</TanStackProvider>;
}
