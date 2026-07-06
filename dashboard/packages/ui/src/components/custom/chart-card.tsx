'use client';

import * as React from 'react';
import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { GlassCard, GlassCardHeader, GlassCardContent } from './glass-card';

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
  height?: number;
}

const ChartCard = memo(React.forwardRef<HTMLDivElement, ChartCardProps>(
  ({ className, title, description, action, loading, children, height = 280, ...props }, ref) => (
    <GlassCard ref={ref} variant="navy" gradient className={cn('overflow-hidden', className)} {...props}>
      <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-400">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </GlassCardHeader>
      <GlassCardContent>
        {loading ? (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ height, backgroundColor: 'var(--color-border-subtle-light)' }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-primary-400" style={{ borderRightColor: 'var(--color-kbd-border)', borderBottomColor: 'var(--color-kbd-border)', borderLeftColor: 'var(--color-kbd-border)' }} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ height }}
          >
            {children}
          </motion.div>
        )}
      </GlassCardContent>
    </GlassCard>
  ),
));
ChartCard.displayName = 'ChartCard';

const chartColors = {
  primary: '#3b82f6',
  accent: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',
  neutral: '#64748b',
  grid: 'rgba(255,255,255,0.06)',
  text: '#64748b',
};

const gradientDefs = (id: string, color: string) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.25} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  </defs>
);

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 shadow-xl backdrop-blur-xl" style={{ borderColor: 'var(--color-kbd-border)', backgroundColor: 'var(--color-surface-elevated)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
});

type AreaChartProps = {
  data: { name: string; value: number; value2?: number }[];
  areas: { key: string; color: string }[];
  height?: number;
};

const ChartArea = memo(function ChartArea({ data, areas, height = 220 }: AreaChartProps) {
  const id = React.useId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        {gradientDefs(`gradient-${id}`, areas[0]?.color ?? chartColors.primary)}
        {areas.length > 1 && gradientDefs(`gradient-${id}-2`, areas[1]?.color ?? chartColors.accent)}
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {areas.map((area, i) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            stroke={area.color}
            fill={`url(#gradient-${id}${i > 0 ? '-2' : ''})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: area.color, strokeWidth: 0, className: 'drop-shadow-lg' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
});

type LineChartProps = {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
};

const ChartLine = memo(function ChartLine({ data, color = chartColors.primary, height = 220 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: color, strokeWidth: 0, className: 'drop-shadow-lg' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

type BarChartProps = {
  data: { name: string; value: number; color?: string }[];
  height?: number;
};

const ChartBar = memo(function ChartBar({ data, height = 220 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? chartColors.primary} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

type DonutChartProps = {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
};

const ChartDonut = memo(function ChartDonut({ data, height = 220, innerRadius = 60, outerRadius = 85 }: DonutChartProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

type GaugeChartProps = {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  height?: number;
};

const ChartGauge = memo(function ChartGauge({ value, max = 100, label, color = chartColors.primary, height = 160 }: GaugeChartProps) {
  const percentage = useMemo(() => Math.min((value / max) * 100, 100), [value, max]);
  const data = [
    { name: 'value', value: percentage, color },
    { name: 'remainder', value: 100 - percentage, color: 'var(--color-kbd-bg)' },
  ];

  return (
    <div className="flex flex-col items-center" style={{ height }}>
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={85}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}{max > 1 ? `/${max}` : ''}</span>
        {label && <p className="text-xs text-neutral-400 mt-0.5">{label}</p>}
      </div>
    </div>
  );
});

export {
  ChartCard,
  ChartArea,
  ChartLine,
  ChartBar,
  ChartDonut,
  ChartGauge,
  chartColors,
};
