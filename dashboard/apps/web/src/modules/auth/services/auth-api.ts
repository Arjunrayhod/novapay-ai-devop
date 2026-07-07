import { api } from '@aegisai/utils';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', { username, email, password });
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { username, password });
}

export async function fetchMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/api/auth/me');
}
