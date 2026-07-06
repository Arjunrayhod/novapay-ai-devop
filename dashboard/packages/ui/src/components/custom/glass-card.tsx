'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'navy';
  gradient?: boolean;
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'navy', gradient = false, hover = false, ...props }, ref) => {
    const Component = hover ? motion.div : 'div';
    const motionProps = hover
      ? {
          whileHover: { y: -2, scale: 1.01 },
          transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-xl border backdrop-blur-xl transition-all duration-300',
          gradient && 'gradient-border-hover',
          'border-[var(--color-border-light)]',
          variant === 'light' &&
            'text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)]',
          variant === 'dark' &&
            'text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)]',
          variant === 'navy' &&
            'text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)]',
          hover && 'cursor-default',
          className,
        )}
        {...motionProps}
        {...(props as any)}
      />
    );
  },
);
GlassCard.displayName = 'GlassCard';

const GlassCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5 pb-0', className)} {...props} />
  ),
);
GlassCardHeader.displayName = 'GlassCardHeader';

const GlassCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5', className)} {...props} />
  ),
);
GlassCardContent.displayName = 'GlassCardContent';

export { GlassCard, GlassCardHeader, GlassCardContent };
