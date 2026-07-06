'use client';

import { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Bot, Server, Shield, GitBranch, Sailboat, Hexagon, Activity, FileText, ChevronDown, Check } from 'lucide-react';
import type { Prompt } from '../types';

const iconMap: Record<string, typeof Bot> = {
  Server,
  Shield,
  GitBranch,
  Sailboat,
  Hexagon,
  Activity,
  FileText,
};

interface AIPromptSelectorProps {
  prompts?: Prompt[];
  selectedPromptId: string;
  onSelect: (promptId: string) => void;
  isLoading?: boolean;
}

export function AIPromptSelector({ prompts, selectedPromptId, onSelect, isLoading }: AIPromptSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedPrompt = prompts?.find((p) => p.id === selectedPromptId);

  if (isLoading || !prompts) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      >
        {selectedPrompt ? (
          <>
            {(() => {
              const Icon = iconMap[selectedPrompt.icon] || Bot;
              return <Icon className="h-4 w-4 text-primary-500" />;
            })()}
            <span className="flex-1 font-medium text-neutral-900 dark:text-neutral-50">
              {selectedPrompt.name}
            </span>
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 text-neutral-400" />
            <span className="flex-1 text-neutral-500">Select persona...</span>
          </>
        )}
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
          {prompts.map((prompt) => {
            const Icon = iconMap[prompt.icon] || Bot;
            const isSelected = prompt.id === selectedPromptId;
            return (
              <button
                key={prompt.id}
                onClick={() => {
                  onSelect(prompt.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                  isSelected ? 'bg-primary-500/5' : ''
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-500' : 'text-neutral-400'}`} />
                <div className="flex-1">
                  <div className={`font-medium ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {prompt.name}
                  </div>
                  <div className="text-xs text-neutral-500">{prompt.description}</div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
