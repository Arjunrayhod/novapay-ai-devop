'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const Navbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-14 items-center gap-4 border-b border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900',
        className,
      )}
      {...props}
    />
  ),
);
Navbar.displayName = 'Navbar';

const NavbarLeft = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2', className)} {...props} />
  ),
);
NavbarLeft.displayName = 'NavbarLeft';

const NavbarRight = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('ml-auto flex items-center gap-2', className)} {...props} />
  ),
);
NavbarRight.displayName = 'NavbarRight';

const NavbarTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  ),
);
NavbarTitle.displayName = 'NavbarTitle';

const NavbarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-6 w-px bg-neutral-200 dark:bg-neutral-700', className)}
      {...props}
    />
  ),
);
NavbarSeparator.displayName = 'NavbarSeparator';

export { Navbar, NavbarLeft, NavbarRight, NavbarTitle, NavbarSeparator };
