'use client';

import { Toaster } from '@aegisai/ui';
import { ThemeProvider } from '@aegisai/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
