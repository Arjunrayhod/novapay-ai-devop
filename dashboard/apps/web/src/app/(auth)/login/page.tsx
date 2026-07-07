'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/modules/auth/components/auth-modal';
import { useAuth } from '@/modules/auth/hooks/use-auth';

export default function LoginPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.push('/');
    }
  }, [token, loading, router]);

  if (loading) return null;

  if (token) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <AuthModal />
    </div>
  );
}
