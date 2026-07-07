'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard, GlassCardHeader, GlassCardContent, StatusBadge } from '@aegisai/ui';
import { Play, RefreshCw, ExternalLink, ChevronDown, ChevronRight, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { GitHubWorkflow, GitHubWorkflowRun, WorkflowRunJob } from '../types';
import { fetchWorkflows, dispatchWorkflow, fetchWorkflowRuns, fetchRunJobs } from '../services/github-workflows';

function getStatusColor(status: string, conclusion: string | null) {
  if (conclusion === 'success') return 'success' as const;
  if (conclusion === 'failure') return 'danger' as const;
  if (status === 'in_progress') return 'warning' as const;
  if (status === 'queued') return 'neutral' as const;
  return 'neutral' as const;
}

function getStatusLabel(status: string, conclusion: string | null) {
  if (conclusion === 'success') return 'Passed';
  if (conclusion === 'failure') return 'Failed';
  if (status === 'in_progress') return 'Running';
  if (status === 'queued') return 'Queued';
  return conclusion ?? status;
}

function StepIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (conclusion === 'success') return <CheckCircle className="h-3.5 w-3.5 text-success-500" />;
  if (conclusion === 'failure') return <XCircle className="h-3.5 w-3.5 text-danger-400" />;
  if (status === 'in_progress') return <Loader2 className="h-3.5 w-3.5 text-warning-500 animate-spin" />;
  if (status === 'queued') return <Clock className="h-3.5 w-3.5 text-neutral-400" />;
  return <Clock className="h-3.5 w-3.5 text-neutral-400" />;
}

function RunJobs({ runId, isOpen }: { runId: number; isOpen: boolean }) {
  const [jobs, setJobs] = useState<WorkflowRunJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchRunJobs(runId).then(setJobs).catch(() => {}).finally(() => setLoading(false));
  }, [runId, isOpen]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <Loader2 className="h-3 w-3 animate-spin" /> Loading jobs...
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-border-light)' }}>
      {jobs.map((job) => (
        <div key={job.id}>
          <button
            onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover-bg"
          >
            {expandedJob === job.id ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{job.name}</span>
            <StatusBadge status={getStatusColor(job.status, job.conclusion)} dot={false}>
              {getStatusLabel(job.status, job.conclusion)}
            </StatusBadge>
          </button>
          {expandedJob === job.id && (
            <div className="border-t px-6 py-1" style={{ borderColor: 'var(--color-border-light)' }}>
              {job.steps.map((step) => (
                <div key={step.number} className="flex items-center gap-2 py-1.5">
                  <StepIcon status={step.status} conclusion={step.conclusion} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{step.name}</span>
                  <span className="ml-auto text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {getStatusLabel(step.status, step.conclusion)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function GitHubWorkflowRunner() {
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [runs, setRuns] = useState<GitHubWorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<number | null>(null);
  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [wf, wfRuns] = await Promise.all([fetchWorkflows(), fetchWorkflowRuns()]);
      setWorkflows(wf);
      setRuns(wfRuns);
      setError(null);
    } catch {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeRuns = runs.filter(
    (r) => r.status === 'in_progress' || r.status === 'queued',
  );

  useEffect(() => {
    if (activeRuns.length === 0) return;
    const interval = setInterval(() => {
      fetchWorkflowRuns().then(setRuns).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeRuns.length]);

  const handleTrigger = async (workflowId: number) => {
    setTriggering(workflowId);
    try {
      await dispatchWorkflow(workflowId);
      setTimeout(() => loadData(), 2000);
    } catch {
      setError('Failed to trigger workflow');
    } finally {
      setTriggering(null);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Workflow Runner
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Trigger and monitor GitHub Actions workflows
            </p>
          </div>
          <button
            onClick={loadData}
            className="rounded-lg border p-2 transition-colors hover-bg"
            style={{ borderColor: 'var(--color-border-light)' }}
          >
            <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-danger-400 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}

        {activeRuns.length > 0 && (
          <div className="border-b px-4 py-2" style={{ borderColor: 'var(--color-border-light)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warning-500 mb-2">
              Running ({activeRuns.length})
            </p>
            {activeRuns.map((run) => (
              <div key={run.id} className="flex items-center gap-2 py-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin text-warning-500" />
                <span style={{ color: 'var(--color-text-primary)' }}>{run.name}</span>
                <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{run.head_branch}</span>
              </div>
            ))}
          </div>
        )}

        <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
          {workflows
            .filter((w) => w.state === 'active')
            .map((wf) => (
              <div key={wf.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover-bg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {wf.name}
                  </p>
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {wf.path}
                  </p>
                </div>
                <button
                  onClick={() => handleTrigger(wf.id)}
                  disabled={triggering === wf.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover-bg disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  {triggering === wf.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {triggering === wf.id ? 'Triggering...' : 'Run'}
                </button>
              </div>
            ))}
        </div>

        {runs.length > 0 && (
          <>
            <div className="border-t px-4 py-2" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Recent Runs
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
              {runs.slice(0, 10).map((run) => (
                <div key={run.id}>
                  <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover-bg">
                    <StatusBadge status={getStatusColor(run.status, run.conclusion)} dot={false}>
                      {getStatusLabel(run.status, run.conclusion)}
                    </StatusBadge>
                    <button
                      onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {run.name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {run.actor?.login ?? 'unknown'} · {run.head_branch} · {run.head_sha}
                      </p>
                    </button>
                    <a
                      href={run.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded p-1 transition-colors hover-bg"
                    >
                      <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                    </a>
                  </div>
                  <RunJobs runId={run.id} isOpen={expandedRun === run.id} />
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
