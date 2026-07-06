'use client';

import * as React from 'react';
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { GlassCard } from './glass-card';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  sparklineData?: number[];
  health?: 'success' | 'warning' | 'danger' | 'neutral';
  lastUpdate?: string;
  loading?: boolean;
}

const Sparkline = memo(({ data, className }: { data: number[]; className?: string }) => {
  if (!data || data.length < 2) return null;
  const width = 80;
  const height = 32;
  const { points, pathD } = useMemo(() => {
    const mx = Math.max(...data);
    const mn = Math.min(...data);
    const rng = mx - mn || 1;
    const ln = data.length;
    const pts = data.map((v, i) => {
      const x = (i / (ln - 1)) * width;
      const y = height - ((v - mn) / rng) * (height - 6) - 3;
      return `${x},${y}`;
    });
    return {
      points: pts,
      pathD: `M${pts.join(' L')} L${width},${height} L0,${height} Z`,
    };
  }, [data]);
  const trendUp = (data[data.length - 1] ?? 0) >= (data[0] ?? 0);
  const color = trendUp ? 'rgb(34 197 94)' : 'rgb(239 68 68)';
  const gradientId = React.useId();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`spark-fill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill={`url(#spark-fill-${gradientId})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      title,
      value,
      description,
      icon,
      trend,
      trendValue,
      sparklineData,
      health,
      lastUpdate,
      loading,
      ...props
    },
    ref,
  ) => {
    if (loading) {
      return (
        <GlassCard ref={ref} variant="navy" className={className} {...props}>
          <div className="p-5 space-y-4">
            <div className="h-3 w-24 animate-pulse rounded" style={{ backgroundColor: 'var(--color-hover-bg)' }} />
            <div className="h-9 w-20 animate-pulse rounded" style={{ backgroundColor: 'var(--color-hover-bg)' }} />
            <div className="h-3 w-32 animate-pulse rounded" style={{ backgroundColor: 'var(--color-hover-bg)' }} />
          </div>
        </GlassCard>
      );
    }

    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <GlassCard
          ref={ref}
          variant="navy"
          gradient
          className={cn(
            'group cursor-default relative overflow-hidden',
            'hover:border-primary-500/20 hover:shadow-glow-primary/10',
            'before:absolute before:inset-0 before:opacity-0 before:bg-gradient-to-br before:from-primary-500/[0.04] before:to-transparent before:transition-opacity before:duration-300 hover:before:opacity-100',
            className,
          )}
          {...props}
        >
          <div className="p-5 space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 group-hover:shadow-glow-primary/20 transition-all duration-300">
                    {icon}
                  </div>
                )}
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
              </div>
              {health && (
                <span
                  className={cn(
                    'flex h-2 w-2 rounded-full',
                    health === 'success' && 'bg-success-500 shadow-lg shadow-success-500/30',
                    health === 'warning' && 'bg-warning-500 shadow-lg shadow-warning-500/30',
                    health === 'danger' && 'bg-danger-500 shadow-lg shadow-danger-500/30',
                    health === 'neutral' && 'bg-neutral-500',
                  )}
                />
              )}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                <div className="flex items-center gap-2">
                  {trend && trendValue && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold',
                        trend === 'up' && 'bg-success-500/10 text-success-400',
                        trend === 'down' && 'bg-danger-500/10 text-danger-400',
                        trend === 'neutral' && 'bg-neutral-500/10 text-neutral-400',
                      )}
                    >
                      {trend === 'up' && '\u2191'}
                      {trend === 'down' && '\u2193'}
                      {trendValue}
                    </span>
                  )}
                  {description && (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</span>
                  )}
                </div>
              </div>
              {sparklineData && sparklineData.length >= 2 && (
                <Sparkline data={sparklineData} />
              )}
            </div>

            {lastUpdate && (
                <p className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>Updated {lastUpdate}</p>
              )}
          </div>
        </GlassCard>
      </motion.div>
    );
  },
);
MetricCard.displayName = 'MetricCard';

export { MetricCard };
