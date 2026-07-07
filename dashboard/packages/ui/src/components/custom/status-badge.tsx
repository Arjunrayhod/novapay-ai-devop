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
    'bg-success-500/10 text-success-400 border border-success-500/20',
  warning:
    'bg-warning-500/10 text-warning-400 border border-warning-500/20',
  danger:
    'bg-danger-500/10 text-danger-400 border border-danger-500/20',
  info:
    'bg-primary-500/10 text-primary-400 border border-primary-500/20',
  neutral:
    'text-neutral-400 border',
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
