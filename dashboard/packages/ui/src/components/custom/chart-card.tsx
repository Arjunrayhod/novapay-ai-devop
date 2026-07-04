'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
  height?: number;
}

const ChartCard = React.forwardRef<HTMLDivElement, ChartCardProps>(
  ({ className, title, description, action, loading, children, height = 300, ...props }, ref) => (
    <Card ref={ref} className={cn('overflow-hidden', className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            className="flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800"
            style={{ height }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500 dark:border-neutral-600 dark:border-t-primary-400" />
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  ),
);
ChartCard.displayName = 'ChartCard';

export { ChartCard };
