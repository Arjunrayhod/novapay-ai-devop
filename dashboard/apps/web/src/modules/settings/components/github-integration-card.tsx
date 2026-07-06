'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { Github, Link2, Link2Off, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { ApiError } from '@aegisai/utils';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import {
  getGitHubConnection,
  testGitHubConnection,
  saveGitHubConnection,
  deleteGitHubConnection,
} from '../services/settings-api';

function parseError(err: unknown): string {
  if (err instanceof ApiError) {
    const status = err.status;
    if (status === 401) return 'Invalid GitHub token. Check your token has the required scopes (repo, read:org).';
    if (status === 403) return 'GitHub access denied. Your token may lack permissions.';
    if (status === 404) return 'GitHub resource not found.';
    if (status === 429) return 'GitHub API rate limit exceeded. Wait a moment and retry.';
    try {
      const body = JSON.parse(err.message);
      return body.detail ?? err.message;
    } catch {
      return err.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

export function GitHubIntegrationCard() {
  const { token } = useAuth();
  const router = useRouter();

  const [connection, setConnection] = useState<{ connected: boolean; github_username?: string }>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [pat, setPat] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; github_username?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const status = await getGitHubConnection(token);
      setConnection(status);
    } catch {
      setConnection({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleTest = async () => {
    if (!token || !username || !pat) return;
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      const result = await testGitHubConnection(token, username, pat);
      setTestResult(result);
    } catch (e: unknown) {
      setError(parseError(e));
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!token || !username || !pat) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveGitHubConnection(token, username, pat);
      setConnection(result);
      setPat('');
    } catch (e: unknown) {
      setError(parseError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await deleteGitHubConnection(token);
      setConnection({ connected: false });
      setUsername('');
      setTestResult(null);
    } catch (e: unknown) {
      setError(parseError(e));
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <GlassCard>
        <GlassCardContent className="p-5">
          <div className="flex flex-col items-center gap-4 py-4">
            <Github className="h-8 w-8 text-neutral-400" />
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Sign in to configure your GitHub integration.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            GitHub Integration
          </h3>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
          ) : (
            <StatusBadge status={connection.connected ? 'success' : 'neutral'} dot={false}>
              {connection.connected ? 'Connected' : 'Not Connected'}
            </StatusBadge>
          )}
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        ) : connection.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border-light)' }}>
              <CheckCircle className="h-5 w-5 text-success-500 shrink-0" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Connected as: {connection.github_username}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Your GitHub data will be used across the dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover-bg disabled:opacity-50"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                Disconnect
              </button>
              <button
                onClick={fetchStatus}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover-bg"
                style={{ borderColor: 'var(--color-border-light)' }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border bg-warning-500/5 p-3" style={{ borderColor: 'var(--color-border-light)' }}>
              <AlertCircle className="h-4 w-4 text-warning-500 shrink-0" />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                GitHub not connected. Connect your account to view your repositories and workflows.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. octocat"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500"
                  style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Personal Access Token
                </label>
                <div className="relative">
                  <input
                    type={showPat ? 'text' : 'password'}
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-primary-500"
                    style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  />
                  <button
                    onClick={() => setShowPat(!showPat)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover-bg"
                  >
                    {showPat ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`flex items-center gap-2 rounded-lg border p-2.5 ${testResult.valid ? 'border-success-500/30 bg-success-500/5' : 'border-danger-500/30 bg-danger-500/5'}`}>
                  {testResult.valid ? (
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-danger-400 shrink-0" />
                  )}
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {testResult.valid
                      ? `Token valid — authenticated as ${testResult.github_username}`
                      : 'Token is invalid or expired'}
                  </span>
                </div>
              )}

              {error && (
                <p className="text-xs text-danger-400">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={testing || !username || !pat}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium transition-all hover-bg disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Test Connection
                </button>
                <button
                  onClick={handleConnect}
                  disabled={saving || testResult?.valid !== true}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary-500)' }}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
