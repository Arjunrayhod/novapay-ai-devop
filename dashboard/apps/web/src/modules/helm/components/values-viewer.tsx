'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search } from '@aegisai/ui';
import { FileJson, Copy, Check } from 'lucide-react';
import type { HelmValues } from '../types';

interface ValuesViewerProps {
  values?: HelmValues;
  isLoading?: boolean;
}

export function ValuesViewer({ values, isLoading }: ValuesViewerProps) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!values?.values) return;
    await navigator.clipboard.writeText(values.values);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = (text: string, query: string): string => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning-200 dark:bg-warning-800 rounded px-0.5">$1</mark>');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Values</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[...Array(15)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" style={{ width: `${40 + Math.random() * 60}%` }} />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!values || !values.values) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Values</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-400">No values available for this release.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-neutral-400" />
            <CardTitle className="text-base font-semibold">Values</CardTitle>
            <span className="text-xs text-neutral-400">{values.release}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="mt-3">
          <Search placeholder="Search values..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/50">
          <pre className="font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {search ? (
              <span dangerouslySetInnerHTML={{ __html: highlightMatches(values.values, search) }} />
            ) : (
              values.values
            )}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
