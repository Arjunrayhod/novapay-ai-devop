'use client';

import { Bot, Sparkles, Activity, Cpu, TrendingUp, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AIStatusCardProps {
  className?: string;
}

const models = [
  { provider: 'OpenAI', model: 'GPT-4o', latency: '210ms', confidence: 97, status: 'active' as const },
  { provider: 'Anthropic', model: 'Claude 3.5', latency: '380ms', confidence: 94, status: 'active' as const },
  { provider: 'DeepSeek', model: 'Coder-V2', latency: '150ms', confidence: 91, status: 'active' as const },
];

const recommendations = [
  { text: 'Scale cluster eu-1 from 4 to 6 nodes', impact: 'high', reason: 'CPU threshold at 82%' },
  { text: 'Review cache hit ratio in prod-api', impact: 'medium', reason: 'Ratio dropped to 68%' },
  { text: 'Update Vault policy for access rotation', impact: 'low', reason: '90 days since last rotation' },
];

const recentActivity = [
  { time: '2m ago', event: 'Deployment prod-api v3.2.1 rolled out', type: 'success' as const },
  { time: '15m ago', event: 'Auto-scaled cluster eu-1 from 4 to 6 nodes', type: 'info' as const },
  { time: '1h ago', event: 'Vault policy rotation completed', type: 'success' as const },
  { time: '2h ago', event: 'Security scan found 3 vulnerabilities', type: 'warning' as const },
];

export function AIStatusCard({ className }: AIStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border backdrop-blur-xl',
        'card-glow',
        className,
      )}
      style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-surface-glass)' }}
    >
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
              <Bot className="h-5 w-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-success-500 border-2" style={{ borderColor: 'var(--color-surface-elevated)' }} />
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>AI Operations</h3>
              <p className="text-xs text-neutral-400">Intelligent monitoring active</p>
            </div>
          </div>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-[10px] font-medium text-primary-400 border border-primary-500/20"
          >
            <Sparkles className="h-3 w-3" />
            3 Models Online
          </motion.span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Active Models</p>
            <span className="text-[10px] text-success-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              All Connected
            </span>
          </div>
          {models.map((m, i) => (
            <motion.div
              key={m.model}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-[var(--color-hover-bg)]" style={{ backgroundColor: 'var(--color-border-subtle-light)', borderColor: 'var(--color-border-light)' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                <Cpu className="h-4 w-4 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.provider}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-medium text-neutral-400 border" style={{ backgroundColor: 'var(--color-kbd-bg)', borderColor: 'var(--color-border-light)' }}>
                    {m.model}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Zap className="h-2.5 w-2.5 text-warning-400" />
                    {m.latency}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <TrendingUp className="h-2.5 w-2.5 text-primary-400" />
                    {m.confidence}% confidence
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-success-400 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
                </span>
                Active
              </span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">AI Recommendations</p>
            <motion.button
              whileHover={{ x: 2 }}
              className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-colors cursor-pointer border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-border-light)]"
            >
              <Activity className={cn(
                'h-3.5 w-3.5 mt-0.5 shrink-0',
                rec.impact === 'high' && 'text-danger-400',
                rec.impact === 'medium' && 'text-warning-400',
                rec.impact === 'low' && 'text-primary-400',
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-neutral-200">{rec.text}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{rec.reason}</p>
              </div>
              <span className={cn(
                'text-[9px] font-medium uppercase px-1.5 py-0.5 rounded border',
                rec.impact === 'high' && 'bg-danger-500/10 text-danger-400 border-danger-500/20',
                rec.impact === 'medium' && 'bg-warning-500/10 text-warning-400 border-warning-500/20',
                rec.impact === 'low' && 'bg-primary-500/10 text-primary-400 border-primary-500/20',
              )}>
                {rec.impact}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Recent Activity</p>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div
                key={item.time}
                className="flex items-start gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[var(--color-hover-bg)]"
              >
                <span className="shrink-0 text-neutral-500">{item.time}</span>
                <span className="flex-1 text-neutral-300">{item.event}</span>
                {item.type === 'warning' && <Activity className="h-3 w-3 shrink-0 text-warning-500" />}
                {item.type === 'success' && <CheckCircle className="h-3 w-3 shrink-0 text-success-500" />}
                {item.type === 'info' && <Shield className="h-3 w-3 shrink-0 text-primary-500" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-accent-500/5 px-3 py-2.5 border border-accent-500/10">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          <span className="text-xs text-accent-300">All systems nominal. AI agents are monitoring 847 pods across 12 clusters.</span>
        </div>
      </div>
    </motion.div>
  );
}
