import * as React from 'react';
import { cn } from '../../lib/utils';

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900': variant === 'default',
          'border-transparent bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50': variant === 'secondary',
          'border-transparent bg-danger-500 text-neutral-50': variant === 'destructive',
          'border-neutral-200 text-neutral-900 dark:border-neutral-700 dark:text-neutral-50': variant === 'outline',
          'border-transparent bg-success-500/10 text-success-900 dark:text-success-500': variant === 'success',
          'border-transparent bg-warning-500/10 text-warning-900 dark:text-warning-500': variant === 'warning',
        },
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { Badge };
