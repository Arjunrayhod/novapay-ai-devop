export * from './kubernetes';
export * from './docker';
export * from './terraform';
export * from './helm';
export * from './github';
export * from './monitoring';
export * from './environment';
export * from './security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  avatar: string | null;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'loading';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source: string;
}
