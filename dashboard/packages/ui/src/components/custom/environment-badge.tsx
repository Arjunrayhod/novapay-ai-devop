'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type Environment = 'production' | 'staging' | 'development' | 'sandbox';

interface EnvironmentBadgeProps {
  environments?: Environment[];
  defaultEnv?: Environment;
  onChange?: (env: Environment) => void;
  className?: string;
}

const envConfig: Record<Environment, { label: string; dotClass: string; bgClass: string }> = {
  production: {
    label: 'Production',
    dotClass: 'bg-danger-500',
    bgClass: 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400',
  },
  staging: {
    label: 'Staging',
    dotClass: 'bg-warning-500',
    bgClass: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
  },
  development: {
    label: 'Development',
    dotClass: 'bg-success-500',
    bgClass: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400',
  },
  sandbox: {
    label: 'Sandbox',
    dotClass: 'bg-accent-500',
    bgClass: 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400',
  },
};

export function EnvironmentBadge({
  environments = ['production', 'staging', 'development', 'sandbox'],
  defaultEnv = 'development',
  onChange,
  className,
}: EnvironmentBadgeProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Environment>(defaultEnv);

  const config = envConfig[selected];

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
          config.bgClass,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
        {config.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-surface shadow-lg animate-enter" role="listbox">
          {environments.map((env) => {
            const cfg = envConfig[env];
            return (
              <button
                key={env}
                role="option"
                aria-selected={selected === env}
                onClick={() => {
                  setSelected(env);
                  setOpen(false);
                  onChange?.(env);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  selected === env && 'bg-neutral-50 dark:bg-neutral-800/50',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dotClass)} />
                <span className="flex-1">{cfg.label}</span>
                {selected === env && <Check className="h-3 w-3 text-primary-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
