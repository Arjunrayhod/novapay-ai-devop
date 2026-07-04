'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant;
  dot?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success:
    'bg-success-50 text-success-900 dark:bg-success-900/20 dark:text-success-400',
  warning:
    'bg-warning-50 text-warning-900 dark:bg-warning-900/20 dark:text-warning-400',
  danger:
    'bg-danger-50 text-danger-900 dark:bg-danger-900/20 dark:text-danger-400',
  info:
    'bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-400',
  neutral:
    'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-primary-500',
  neutral: 'bg-neutral-400',
};

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, dot = true, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[status],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotStyles[status])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  ),
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
