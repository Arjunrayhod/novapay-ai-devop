'use client';

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '@aegisai/utils';
import type { AuthUser } from '../services/auth-api';
import { fetchMe, loginUser, registerUser } from '../services/auth-api';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const TOKEN_KEY = 'aegisai_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      api.setAuthToken(stored);
      fetchMe()
        .then((u) => { setToken(stored); setUser(u); })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            api.setAuthToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await loginUser(username, password);
    api.setAuthToken(res.token);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await registerUser(username, email, password);
    api.setAuthToken(res.token);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    api.setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
