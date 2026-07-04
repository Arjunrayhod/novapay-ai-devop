'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  maxHeight?: number;
}

const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ className, title = 'Terminal', maxHeight = 400, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-700 bg-neutral-950 font-mono text-sm text-green-400 shadow-lg',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 border-b border-neutral-700 bg-neutral-900 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-danger-500" />
          <div className="h-3 w-3 rounded-full bg-warning-500" />
          <div className="h-3 w-3 rounded-full bg-success-500" />
        </div>
        <span className="text-xs text-neutral-400">{title}</span>
      </div>
      <div
        className="overflow-y-auto p-4"
        style={{ maxHeight }}
      >
        {children}
      </div>
    </div>
  ),
);
Terminal.displayName = 'Terminal';

const TerminalLine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { prefix?: string }
>(({ className, prefix = '$', children, ...props }, ref) => (
  <div ref={ref} className={cn('flex gap-2', className)} {...props}>
    <span className="shrink-0 text-neutral-500">{prefix}</span>
    <span className="flex-1">{children}</span>
  </div>
));
TerminalLine.displayName = 'TerminalLine';

export { Terminal, TerminalLine };
