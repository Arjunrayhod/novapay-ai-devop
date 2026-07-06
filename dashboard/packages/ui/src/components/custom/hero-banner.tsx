'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Globe, Activity, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeroBannerProps {
  className?: string;
  aiHealth?: {
    provider: string;
    model: string;
    available: boolean;
  };
  aiLoading?: boolean;
  onOpenAI?: () => void;
  onRetryAI?: () => void;
}

const stats = [
  { label: 'Active Clusters', value: '12', icon: Globe },
  { label: 'Total Pods', value: '847', icon: Cpu },
  { label: 'Uptime', value: '99.97%', icon: Activity },
  { label: 'Security Score', value: 'A+', icon: Shield },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const neuralNodes = [
  { x: 50, y: 18, r: 2.5, color: '#60a5fa' },
  { x: 22, y: 42, r: 2, color: '#a78bfa' },
  { x: 78, y: 42, r: 2, color: '#22d3ee' },
  { x: 15, y: 72, r: 1.8, color: '#60a5fa' },
  { x: 50, y: 78, r: 2.2, color: '#a78bfa' },
  { x: 85, y: 72, r: 1.8, color: '#22d3ee' },
  { x: 35, y: 55, r: 1.5, color: '#818cf8' },
  { x: 65, y: 55, r: 1.5, color: '#2dd4bf' },
];

const neuralEdges: [number, number][] = [
  [0, 1], [0, 2], [0, 6], [0, 7],
  [1, 3], [1, 6], [2, 5], [2, 7],
  [3, 6], [5, 7], [3, 4], [4, 5], [4, 6], [4, 7],
];

function generateParticles() {
  return Array.from({ length: 12 }, () => ({
    x: 30 + Math.random() * 40,
    y: 15 + Math.random() * 70,
    size: 1 + Math.random() * 1.5,
    duration: 3 + Math.random() * 3,
    delay: Math.random() * 3,
    driftX: (Math.random() - 0.5) * 20,
    driftY: (Math.random() - 0.5) * 15,
  }));
}

function NeuralNetworkSVG() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
      {neuralEdges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={neuralNodes[i]!.x}
          y1={neuralNodes[i]!.y}
          x2={neuralNodes[j]!.x}
          y2={neuralNodes[j]!.y}
          stroke="url(#neural-gradient)"
          strokeWidth="0.4"
          strokeOpacity="0.4"
        />
      ))}
      {neuralNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill={node.color}
          fillOpacity="0.7"
        />
      ))}
      <defs>
        <linearGradient id="neural-gradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeroBanner({ className, aiHealth, aiLoading, onOpenAI, onRetryAI }: HeroBannerProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  const handleOrbClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1000);
    onOpenAI?.();
  }, [onOpenAI]);

  const isAIOnline = aiHealth?.available ?? false;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary-500/20',
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, var(--color-panel-bg), var(--color-surface-elevated), var(--color-page-bg))',
      }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 via-accent-500/[0.03] to-transparent" />

      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl animate-aurora" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl animate-aurora" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-1/3 h-40 w-40 rounded-full bg-primary-500/5 blur-3xl animate-float" />

      <div className="relative z-10 flex flex-col gap-8 p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-500/10 px-3 py-1 text-xs font-medium text-success-400 border border-success-500/20 shadow-lg shadow-success-500/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
              </span>
              All Systems Nominal
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>v3.2.1</span>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Enterprise{' '}
              <span className="bg-gradient-to-r from-primary-400 via-accent-300 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">DevSecOps</span>
              <br />
              <span style={{ color: 'var(--color-text-secondary)' }}>Control Center</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Intelligent infrastructure management with AI-powered monitoring,
              automated security scanning, and real-time observability across
              your entire DevOps pipeline.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-2.5 rounded-xl border px-4 py-2.5 backdrop-blur-sm transition-colors hover-bg"
                  style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-hover-bg)' }}
                >
                  <Icon className="h-4 w-4 text-primary-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="flex shrink-0 flex-col items-center gap-5"
        >
          <motion.div
            ref={orbRef}
            onClick={handleOrbClick}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="relative cursor-pointer"
            animate={{
              scale: hovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ perspective: '600px' }}
          >
            <motion.div
              className="h-48 w-48 md:h-56 md:w-56"
              animate={{
                rotateX: hovered ? 5 : 0,
                rotateY: hovered ? -5 : 0,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="relative h-full w-full">
                <div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{
                    background: hovered
                      ? 'radial-gradient(circle, rgba(59,130,246,0.4), rgba(168,85,247,0.3), rgba(6,182,212,0.2))'
                      : 'radial-gradient(circle, rgba(59,130,246,0.25), rgba(168,85,247,0.15), rgba(6,182,212,0.1))',
                    transition: 'background 0.4s ease',
                  }}
                />

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-purple-500/10 blur-xl" />

                <motion.div
                  className="absolute inset-3 rounded-full border-2 border-transparent"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(168,85,247,0.15), rgba(6,182,212,0.3)) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                  className="absolute inset-6 rounded-full border border-dashed border-accent-400/25"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                  className="absolute inset-9 rounded-full border border-primary-400/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                  className="absolute inset-11 rounded-full border border-purple-400/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                />

                <div className="absolute inset-0">
                  <NeuralNetworkSVG />
                </div>

                {particles.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      background: i % 3 === 0
                        ? 'rgba(59,130,246,0.6)'
                        : i % 3 === 1
                          ? 'rgba(168,85,247,0.6)'
                          : 'rgba(6,182,212,0.6)',
                    }}
                    animate={{
                      x: [0, p.driftX, 0],
                      y: [0, p.driftY, 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.6, 1.2, 0.6],
                    }}
                    transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: 'easeInOut',
                    }}
                  />
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-20 w-20 md:h-24 md:w-24">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 opacity-90 blur-[2px]" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold tracking-widest text-white drop-shadow-lg md:text-xl">
                        AI
                      </span>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px solid rgba(59,130,246,0.3)',
                    boxShadow: hovered
                      ? '0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(168,85,247,0.15)'
                      : '0 0 20px rgba(59,130,246,0.15), 0 0 40px rgba(168,85,247,0.08)',
                  }}
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.4, 0.1, 0.4],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {ripples.map((ripple) => (
                  <motion.div
                    key={ripple.id}
                    className="absolute rounded-full border border-primary-400/50"
                    style={{
                      left: ripple.x - 4,
                      top: ripple.y - 4,
                      width: 8,
                      height: 8,
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 20, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {aiLoading ? (
                <motion.div
                  className="h-2 w-2 rounded-full bg-neutral-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              ) : (
                <span
                  className={`h-2 w-2 rounded-full ${isAIOnline ? 'bg-success-500' : 'bg-danger-500'}`}
                />
              )}
              <span
                className={`text-xs font-semibold tracking-wider ${
                  aiLoading ? 'text-neutral-400' : isAIOnline ? 'text-success-400' : 'text-danger-400'
                }`}
              >
                {aiLoading ? 'CONNECTING' : isAIOnline ? 'AI ONLINE' : 'AI OFFLINE'}
              </span>
            </div>

            {!aiLoading && isAIOnline && aiHealth && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {aiHealth.provider} {aiHealth.model}
                </span>
              </div>
            )}

            {!aiLoading && !isAIOnline && (
              <button
                onClick={onRetryAI}
                className="flex items-center gap-1 text-[11px] text-primary-400 transition-colors hover:text-primary-300"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}

            <motion.button
              onClick={() => onOpenAI?.()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-shadow"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4), 0 0 48px rgba(139,92,246,0.2)',
                }}
              />
              <div className="absolute inset-0 rounded-xl border border-white/10 backdrop-blur-[1px]" />
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Ask AI Assistant
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
