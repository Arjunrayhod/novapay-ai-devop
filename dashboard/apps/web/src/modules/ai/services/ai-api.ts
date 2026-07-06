import { api } from '@aegisai/utils';
import type {
  AIHealth,
  AIOverview,
  ChatRequest,
  ChatResponse,
  Conversation,
  Insight,
  Prompt,
  ProviderInfo,
  Recommendation,
  ToolDefinition,
} from '../types';

const BASE = '/api/ai';

export async function fetchAIHealth(): Promise<AIHealth> {
  return api.get<AIHealth>(`${BASE}/health`);
}

export async function fetchAIOverview(): Promise<AIOverview> {
  return api.get<AIOverview>(`${BASE}/overview`);
}

export async function fetchAIModels(): Promise<ProviderInfo[]> {
  return api.get<ProviderInfo[]>(`${BASE}/models`);
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return api.post<ChatResponse>(`${BASE}/chat`, request);
}

export async function fetchInsights(): Promise<Insight[]> {
  return api.get<Insight[]>(`${BASE}/insights`);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return api.get<Recommendation[]>(`${BASE}/recommendations`);
}

export async function fetchPrompts(): Promise<Prompt[]> {
  return api.get<Prompt[]>(`${BASE}/prompts`);
}

export async function fetchTools(): Promise<ToolDefinition[]> {
  return api.get<ToolDefinition[]>(`${BASE}/tools`);
}

export async function fetchConversations(): Promise<Conversation[]> {
  return api.get<Conversation[]>(`${BASE}/conversations`);
}

export async function fetchConversation(id: string): Promise<Conversation> {
  return api.get<Conversation>(`${BASE}/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<void> {
  return api.delete(`${BASE}/conversations/${id}`);
}
