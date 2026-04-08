import { useCallback, useMemo } from 'react';
import type { TokenPayload, UserRole } from '../types';

function parseJwt(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function useAuth() {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const payload = accessToken ? parseJwt(accessToken) : null;

  const isAuthenticated = useMemo(() => {
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  }, [payload]);

  const role: UserRole | null = payload?.role ?? null;
  const storeId: string | null = payload?.store_id ?? null;
  const tableId: string | null = payload?.table_id ?? null;

  const login = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const isAdmin = role === 'admin';
  const isTable = role === 'table';

  return {
    isAuthenticated,
    role,
    storeId,
    tableId,
    isAdmin,
    isTable,
    login,
    logout,
    accessToken,
  };
}
