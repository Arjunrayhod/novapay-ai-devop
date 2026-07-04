'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, description, icon, trend, trendValue, loading, ...props }, ref) => (
    <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
              {icon && (
                <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend && trendValue && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-sm font-medium',
                    trend === 'up' && 'text-success-500',
                    trend === 'down' && 'text-danger-500',
                    trend === 'neutral' && 'text-neutral-400',
                  )}
                >
                  {trend === 'up' && '\u2191'}
                  {trend === 'down' && '\u2193'}
                  {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  ),
);
MetricCard.displayName = 'MetricCard';

export { MetricCard };
