'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as aiApi from '../services/ai-api';
import type { ChatRequest } from '../types';

export function useAIHealth() {
  return useQuery({
    queryKey: ['ai', 'health'],
    queryFn: aiApi.fetchAIHealth,
    refetchInterval: 10_000,
  });
}

export function useAIOverview() {
  return useQuery({
    queryKey: ['ai', 'overview'],
    queryFn: aiApi.fetchAIOverview,
    refetchInterval: 10_000,
  });
}

export function useAIModels() {
  return useQuery({
    queryKey: ['ai', 'models'],
    queryFn: aiApi.fetchAIModels,
    refetchInterval: 30_000,
    staleTime: 60_000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: aiApi.fetchInsights,
    refetchInterval: 10_000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['ai', 'recommendations'],
    queryFn: aiApi.fetchRecommendations,
    refetchInterval: 10_000,
  });
}

export function usePrompts() {
  return useQuery({
    queryKey: ['ai', 'prompts'],
    queryFn: aiApi.fetchPrompts,
    staleTime: 300_000,
  });
}

export function useTools() {
  return useQuery({
    queryKey: ['ai', 'tools'],
    queryFn: aiApi.fetchTools,
    staleTime: 300_000,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: aiApi.fetchConversations,
    refetchInterval: 10_000,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['ai', 'conversations', id],
    queryFn: () => aiApi.fetchConversation(id),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ChatRequest) => aiApi.sendChatMessage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
  });
}

export function useAI() {
  const health = useAIHealth();
  const overview = useAIOverview();
  const models = useAIModels();
  const insights = useInsights();
  const recommendations = useRecommendations();
  const prompts = usePrompts();
  const conversations = useConversations();

  const isLoading = health.isLoading || overview.isLoading;
  const isError = health.isError;

  const refetch = useCallback(() => {
    health.refetch();
    overview.refetch();
    models.refetch();
    insights.refetch();
    recommendations.refetch();
    prompts.refetch();
    conversations.refetch();
  }, [health, overview, models, insights, recommendations, prompts, conversations]);

  return {
    health: health.data,
    overview: overview.data,
    models: models.data,
    insights: insights.data,
    recommendations: recommendations.data,
    prompts: prompts.data,
    conversations: conversations.data,
    isLoading,
    isError,
    refetch,
  };
}
