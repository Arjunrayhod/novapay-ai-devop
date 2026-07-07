'use client';

import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import {
  ExternalLink, Globe, Terminal, Copy, Check, GitBranch,
  Download, RefreshCw, ArrowUp, GitPullRequest, GitCommit,
  Play, Package,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import type { GitHubRepo } from '../types';

interface GitHubActionsPanelProps {
  repo?: GitHubRepo;
}

interface ActionButton {
  label: string;
  icon: typeof ExternalLink;
  onClick: () => void;
  variant?: 'primary' | 'default';
}

function useCopy(url: string) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);
  return { copied, copy };
}

function ActionBtn({ label, icon: Icon, onClick, variant = 'default' }: ActionButton) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        variant === 'primary'
          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
          : 'border text-neutral-700 dark:text-neutral-300 hover-bg'
      }`}
      style={variant === 'default' ? { borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface)' } : undefined}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function GitHubActionsPanel({ repo }: GitHubActionsPanelProps) {
  const httpsUrl = repo ? `https://github.com/${repo.full_name}.git` : '';
  const sshUrl = repo ? `git@github.com:${repo.full_name}.git` : '';
  const repoUrl = repo?.html_url ?? '';

  const httpsCopy = useCopy(httpsUrl);
  const sshCopy = useCopy(sshUrl);

  const actions: ActionButton[] = [
    {
      label: 'Open Repository',
      icon: ExternalLink,
      onClick: () => window.open(repoUrl, '_blank'),
      variant: 'primary',
    },
    {
      label: 'Open in GitHub',
      icon: Globe,
      onClick: () => window.open(repoUrl, '_blank'),
    },
    {
      label: 'Open in Cursor',
      icon: Terminal,
      onClick: () => window.open(`cursor://${repoUrl}`, '_blank'),
    },
    {
      label: httpsCopy.copied ? 'Copied!' : 'Copy HTTPS URL',
      icon: httpsCopy.copied ? Check : Copy,
      onClick: httpsCopy.copy,
    },
    {
      label: sshCopy.copied ? 'Copied!' : 'Copy SSH URL',
      icon: sshCopy.copied ? Check : Copy,
      onClick: sshCopy.copy,
    },
    {
      label: 'Clone Repository',
      icon: Download,
      onClick: () => window.open(repoUrl, '_blank'),
    },
    {
      label: 'Pull Latest',
      icon: RefreshCw,
      onClick: () => window.open(`${repoUrl}/pulls`, '_blank'),
    },
    {
      label: 'Push Branch',
      icon: ArrowUp,
      onClick: () => window.open(repoUrl, '_blank'),
    },
    {
      label: 'Fetch',
      icon: RefreshCw,
      onClick: () => window.open(repoUrl, '_blank'),
    },
    {
      label: 'Create Branch',
      icon: GitBranch,
      onClick: () => window.open(`${repoUrl}/branches`, '_blank'),
    },
    {
      label: 'Create PR',
      icon: GitPullRequest,
      onClick: () => window.open(`${repoUrl}/pulls/new`, '_blank'),
      variant: 'primary',
    },
    {
      label: 'View Commits',
      icon: GitCommit,
      onClick: () => window.open(`${repoUrl}/commits`, '_blank'),
    },
    {
      label: 'Workflow Runs',
      icon: Play,
      onClick: () => window.open(`${repoUrl}/actions`, '_blank'),
    },
    {
      label: 'View Releases',
      icon: Package,
      onClick: () => window.open(`${repoUrl}/releases`, '_blank'),
    },
  ];

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Repository Actions
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Quick access to repository operations
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <ActionBtn key={action.label} {...action} />
          ))}
        </div>
        <div className="mt-4 border-t pt-3 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Developed by <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Arjun rathod</span>
          </p>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
