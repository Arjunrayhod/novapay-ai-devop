'use client';

import { Shield, Monitor, Cpu, HardDrive, Wrench, Check, X } from 'lucide-react';

const STORAGE_KEY = 'aegisai-system-consent';

interface SystemConsentProps {
  onAllow: () => void;
  onDeny: () => void;
}

export function SystemConsentDialog({ onAllow, onDeny }: SystemConsentProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-overlay)' }}>
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--color-panel-bg)', borderColor: 'var(--color-border-light)' }}
      >
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>System Access Required</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Environment Center needs permission</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-hover-bg)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              The <strong style={{ color: 'var(--color-text-primary)' }}>Environment Center</strong> detects your system configuration to show real-time information about:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Monitor, label: 'OS & Architecture' },
                { icon: Cpu, label: 'CPU & RAM Usage' },
                { icon: HardDrive, label: 'Disk Information' },
                { icon: Wrench, label: 'Installed Tools & Versions' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'var(--color-panel-elevated)' }}>
                  <item.icon className="h-3.5 w-3.5 text-primary-400" />
                  <span style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              This data stays on your machine and is <strong>never sent externally</strong>.
              Refreshing or scanning will re-detect your environment.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDeny}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' }}
            >
              <X className="h-4 w-4" />
              Deny
            </button>
            <button
              onClick={onAllow}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            >
              <Check className="h-4 w-4" />
              Allow & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getSystemConsent(): boolean | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(STORAGE_KEY);
  if (val === 'true') return true;
  if (val === 'false') return false;
  return null;
}

export function setSystemConsent(granted: boolean): void {
  localStorage.setItem(STORAGE_KEY, granted ? 'true' : 'false');
}
