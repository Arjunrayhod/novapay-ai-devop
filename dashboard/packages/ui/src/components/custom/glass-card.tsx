'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'light', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border shadow-glass backdrop-blur-xl',
        variant === 'light'
          ? 'border-white/20 bg-white/60 text-neutral-900'
          : 'border-neutral-700/30 bg-neutral-900/60 text-neutral-50',
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = 'GlassCard';

const GlassCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
GlassCardHeader.displayName = 'GlassCardHeader';

const GlassCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
GlassCardContent.displayName = 'GlassCardContent';

export { GlassCard, GlassCardHeader, GlassCardContent };
