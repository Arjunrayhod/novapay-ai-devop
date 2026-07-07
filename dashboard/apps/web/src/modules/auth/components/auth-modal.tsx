'use client';

import { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { User, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface AuthModalProps {
  onClose?: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      onClose?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-sm mx-auto">
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h3>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500"
              style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500"
                style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500"
              style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {error && (
            <p className="text-xs text-danger-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account? <button type="button" onClick={() => setMode('register')} className="text-primary-400 hover:underline">Register</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-primary-400 hover:underline">Sign In</button></>
            )}
          </p>
        </form>
      </GlassCardContent>
    </GlassCard>
  );
}
