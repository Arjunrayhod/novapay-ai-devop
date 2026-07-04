'use client';

import * as React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  loading?: boolean;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, onSearch, loading, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <div className={cn('relative', className)}>
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          ref={ref}
          type="search"
          onChange={handleChange}
          className={cn(
            'flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 pl-9 py-1 text-sm shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400',
          )}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
          </div>
        )}
      </div>
    );
  },
);
Search.displayName = 'Search';

export { Search };
