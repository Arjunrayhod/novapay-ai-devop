'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Search, StatusBadge } from '@aegisai/ui';
import { Image } from 'lucide-react';
import type { ImageInfo } from '../types';

interface ImagesTableProps {
  images?: ImageInfo[];
  isLoading?: boolean;
}

export function ImagesTable({ images, isLoading }: ImagesTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!images) return [];
    if (!search) return images;
    return images.filter(
      (img) =>
        img.repository.toLowerCase().includes(search.toLowerCase()) ||
        img.tag.toLowerCase().includes(search.toLowerCase()),
    );
  }, [images, search]);

  if (isLoading || !images) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Images</CardTitle>
          <Image className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-3">
          <Search placeholder="Search images..." onSearch={setSearch} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Repository</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Tag</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">ID</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Size</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">
                    No images found
                  </td>
                </tr>
              ) : (
                filtered.map((img) => (
                  <tr key={img.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-50">
                      {img.repository}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status="neutral" dot={false}>
                        {img.tag}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">{img.id}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 md:table-cell">{img.size}</td>
                    <td className="hidden px-4 py-2.5 text-xs text-neutral-500 lg:table-cell">{img.created}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
