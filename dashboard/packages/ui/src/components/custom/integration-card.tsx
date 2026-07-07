'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { StatusBadge } from './status-badge';
import {
  PlugZap, Plug, RefreshCw, Wifi, WifiOff,
  Settings, Play, Square, Loader2, AlertCircle,
} from 'lucide-react';

export interface IntegrationCardIntegration {
  provider: {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: string;
    version: string;
  };
  connection: {
    provider: string;
    connected: boolean;
    status: string;
    health: string;
    version: string;
    last_sync: string | null;
    last_error: string | null;
  };
  config_fields: Array<{ key: string; label: string; type: string; required: boolean; default?: string }>;
  masked_credentials: Record<string, string>;
}

interface IntegrationCardProps {
  integration: IntegrationCardIntegration;
  onConnect?: (providerId: string, credentials: Record<string, string>) => Promise<void>;
  onDisconnect?: (providerId: string) => Promise<void>;
  onTest?: (providerId: string) => Promise<{ success: boolean; message: string }>;
  onRefresh?: (providerId: string) => Promise<void>;
  className?: string;
}

const statusColor: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  connected: 'success',
  disconnected: 'neutral',
  error: 'danger',
  warning: 'warning',
  unknown: 'info',
};

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onTest,
  onRefresh,
  className,
}: IntegrationCardProps) {
  const [testing, setTesting] = React.useState(false);
  const [testMsg, setTestMsg] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [showCreds, setShowCreds] = React.useState(false);
  const [creds, setCreds] = React.useState<Record<string, string>>({});
  const [connecting, setConnecting] = React.useState(false);

  const { provider, connection, config_fields, masked_credentials } = integration;
  const isConnected = connection.connected;

  const status = connection.status as keyof typeof statusColor;
  const badgeStatus = statusColor[status] ?? 'neutral';

  const handleTest = async () => {
    if (!onTest) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const result = await onTest(provider.id);
      setTestMsg(result.message);
    } catch {
      setTestMsg('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!onConnect) return;
    setConnecting(true);
    try {
      await onConnect(provider.id, creds);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    await onDisconnect(provider.id);
  };

  const handleSync = async () => {
    if (!onRefresh) return;
    setSyncing(true);
    try {
      await onRefresh(provider.id);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        'bg-[var(--color-surface-elevated)] hover:shadow-md',
        isConnected
          ? 'border-success-500/20'
          : 'border-[var(--color-border-light)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            isConnected ? 'bg-success-500/10' : 'bg-[var(--color-surface-muted)]',
          )}>
            {isConnected ? (
              <Wifi className="h-5 w-5 text-success-500" />
            ) : (
              <PlugZap className="h-5 w-5 text-[var(--color-text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate text-[var(--color-text-primary)]">
                {provider.name}
              </h3>
              <StatusBadge status={badgeStatus} dot />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
              {provider.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-[var(--color-text-muted)]">Version</span>
        <span className="text-[var(--color-text-primary)] text-right font-mono">
          {connection.version || provider.version || '—'}
        </span>
        <span className="text-[var(--color-text-muted)]">Last Sync</span>
        <span className="text-[var(--color-text-primary)] text-right">
          {connection.last_sync
            ? new Date(connection.last_sync).toLocaleString()
            : 'Never'}
        </span>
        {connection.last_error && (
          <>
            <span className="text-danger-500">Error</span>
            <span className="text-danger-500 text-right truncate" title={connection.last_error}>
              {connection.last_error}
            </span>
          </>
        )}
      </div>

      {!isConnected && config_fields.length > 0 && (
        <div className="mt-3 space-y-2">
          {config_fields.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                {field.label}
                {field.required && <span className="text-danger-500 ml-0.5">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={creds[field.key] ?? ''}
                  onChange={(e) => setCreds((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[60px] resize-none font-mono"
                  placeholder={field.default ?? `Enter ${field.label}`}
                />
              ) : (
                <input
                  type={field.type === 'password' ? 'password' : 'text'}
                  value={creds[field.key] ?? ''}
                  onChange={(e) => setCreds((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder={field.default ?? `Enter ${field.label}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {isConnected && Object.keys(masked_credentials).length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowCreds(!showCreds)}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {showCreds ? 'Hide' : 'Show'} credentials
          </button>
          {showCreds && (
            <div className="mt-1 space-y-1">
              {Object.entries(masked_credentials).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-[var(--color-text-primary)]">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {testMsg && (
        <div className={cn(
          'mt-2 flex items-center gap-1.5 text-xs rounded-lg px-2 py-1',
          testMsg.includes('failed') || testMsg.includes('error')
            ? 'bg-danger-500/10 text-danger-500'
            : 'bg-success-500/10 text-success-500',
        )}>
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{testMsg}</span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              'bg-primary-500 text-white hover:bg-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {connecting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plug className="h-3 w-3" />
            )}
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-danger-500/10 text-danger-500 hover:bg-danger-500/20 transition-all"
          >
            <Square className="h-3 w-3" />
            Disconnect
          </button>
        )}

        <button
          onClick={handleTest}
          disabled={testing}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]',
            'disabled:opacity-50',
          )}
        >
          {testing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {testing ? 'Testing...' : 'Test'}
        </button>

        {isConnected && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]',
              'disabled:opacity-50',
            )}
          >
            <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
            {syncing ? 'Syncing...' : 'Refresh'}
          </button>
        )}

        <button
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all',
            'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          )}
          title="Settings"
        >
          <Settings className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
