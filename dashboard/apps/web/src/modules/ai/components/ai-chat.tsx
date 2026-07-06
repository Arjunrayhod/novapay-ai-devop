'use client';

import { useState, useRef, useEffect } from 'react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@aegisai/ui';
import { Send, Bot, User, Trash2, Copy, Check, Download, Loader2 } from 'lucide-react';
import type { Message } from '../types';
import { useSendChatMessage, useConversations, useConversation, useDeleteConversation } from '../hooks/use-ai';
import { AIPromptSelector } from './ai-prompt-selector';
import { usePrompts } from '../hooks/use-ai';

function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const firstLineEnd = code.indexOf('\n');
        const lang = firstLineEnd >= 0 ? code.slice(0, firstLineEnd).trim() : '';
        const codeContent = firstLineEnd >= 0 ? code.slice(firstLineEnd + 1) : code;

        return (
          <div key={i} className="group relative my-2 overflow-hidden rounded-lg border border-border">
            {lang && (
              <div className="flex items-center justify-between border-b border-border bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500 dark:bg-neutral-800">
                <span>{lang}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
            <pre className="overflow-x-auto bg-neutral-50 p-3 text-sm dark:bg-neutral-900/50">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isUser
          ? 'bg-primary-500 text-white'
          : 'bg-gradient-to-br from-primary-400 to-accent-400 text-white'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`group max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
        }`}>
          {renderContent(message.content)}
        </div>

        <div className={`flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={handleCopy}
            className="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            title="Copy message"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AIChatProps {
  initialPromptId?: string;
}

export function AIChat({ initialPromptId }: AIChatProps) {
  const [input, setInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState(initialPromptId ?? '');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: prompts } = usePrompts();
  const { data: conversations } = useConversations();
  const { data: activeConversation } = useConversation(activeConversationId ?? '');
  const sendMessage = useSendChatMessage();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    if (activeConversation) {
      setLocalMessages(activeConversation.messages);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    const userMessage: Message = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setLocalMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendMessage.mutateAsync({
        message: msg,
        conversation_id: activeConversationId ?? undefined,
        prompt_id: selectedPromptId || undefined,
      });

      setActiveConversationId(response.conversation_id);
      setLocalMessages((prev) => [...prev, response.message]);
    } catch {
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setLocalMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setLocalMessages([]);
    }
    await deleteConversation.mutateAsync(id);
  };

  const handleExport = () => {
    if (localMessages.length === 0) return;
    const json = JSON.stringify({ messages: localMessages, exported_at: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-4">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">AI Assistant</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-48">
                  <AIPromptSelector
                    prompts={prompts}
                    selectedPromptId={selectedPromptId}
                    onSelect={setSelectedPromptId}
                  />
                </div>
                {localMessages.length > 0 && (
                  <>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      title="Export conversation"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                    <button
                      onClick={handleNewChat}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                      title="New chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      New
                    </button>
                  </>
                )}
              </div>
            </div>
          </GlassCardHeader>

          <GlassCardContent>
            <div className="flex flex-col" style={{ minHeight: '400px' }}>
              <div className="flex-1 space-y-4 overflow-y-auto px-1" style={{ maxHeight: '500px' }}>
                {localMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <Bot className="mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                    <h3 className="text-sm font-medium text-neutral-500">How can I help you?</h3>
                    <p className="mt-1 text-xs text-neutral-400">
                      Ask about platform health, security, infrastructure, or anything related to your environment.
                    </p>
                    {selectedPromptId && prompts && (
                      <p className="mt-2 text-xs text-primary-500">
                        Using persona: {prompts.find((p) => p.id === selectedPromptId)?.name}
                      </p>
                    )}
                  </div>
                ) : (
                  localMessages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))
                )}

                {isStreaming && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-800">
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      <span className="text-sm text-neutral-500">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your platform..."
                  disabled={isStreaming}
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 dark:text-neutral-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {conversations && conversations.length > 0 && (
        <div className="hidden w-64 shrink-0 lg:block">
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Conversations</h3>
              <p className="text-xs text-neutral-500">Recent chats</p>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div key={conv.id} className="group flex items-center gap-2">
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`flex-1 truncate rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        activeConversationId === conv.id
                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {conv.title}
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
