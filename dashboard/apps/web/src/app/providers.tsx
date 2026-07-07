'use client';

import { Toaster } from '@aegisai/ui';
import { ThemeProvider } from '@aegisai/ui';
import { AuthProvider } from '@/modules/auth/context/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}
