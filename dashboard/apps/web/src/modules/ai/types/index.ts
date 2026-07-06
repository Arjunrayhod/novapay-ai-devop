export interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  prompt_id?: string;
  model?: string;
}

export interface ChatResponse {
  message: Message;
  conversation_id: string;
  tool_calls?: unknown[];
}

export interface AIHealth {
  provider: string;
  model: string;
  available: boolean;
  message: string;
}

export interface AIOverview {
  provider_available: boolean;
  provider_name: string;
  model: string;
  available_prompts: number;
  available_tools: number;
  active_conversations: number;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  icon: string;
}

export interface Recommendation {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  module: string;
  impact: string;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  summary: string;
  details?: string;
  module?: string;
  severity: string;
}

export interface ProviderInfo {
  name: string;
  model: string;
  available: boolean;
  supports_streaming: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}
