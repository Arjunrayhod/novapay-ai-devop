'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'bar';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const Spinner = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => (
  <svg
    className={cn('animate-spin', sizeMap[size], className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Dots = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-2 w-2 animate-bounce rounded-full bg-current"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const Bar = ({ className }: { className?: string }) => (
  <div className={cn('h-1 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700', className)}>
    <div className="h-full w-full animate-pulse rounded-full bg-primary-500" />
  </div>
);

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = 'md', variant = 'spinner', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-center text-neutral-400', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {variant === 'spinner' && <Spinner size={size} />}
      {variant === 'dots' && <Dots />}
      {variant === 'bar' && <Bar />}
      <span className="sr-only">Loading...</span>
    </div>
  ),
);
Loading.displayName = 'Loading';

export { Loading };
