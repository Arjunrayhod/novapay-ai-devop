'use client';

import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'group toast',
          description: 'group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400',
          actionButton: 'group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900',
          cancelButton: 'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400',
        },
      }}
    />
  );
}
