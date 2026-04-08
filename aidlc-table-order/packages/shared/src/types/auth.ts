import type { UserRole } from './common';

export interface AdminLoginRequest {
  store_id: string;
  username: string;
  password: string;
}

export interface TableSetupRequest {
  store_id: string;
  table_number: number;
  password: string;
}

export interface TableAutoLoginRequest {
  store_id: string;
  table_number: number;
  password: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface TokenPayload {
  sub: string;
  role: UserRole;
  store_id: string;
  table_id?: string;
  exp: number;
  iat: number;
}
