import { apiClient } from './client';
import type {
  AdminLoginRequest,
  TableSetupRequest,
  TableAutoLoginRequest,
  TokenRefreshRequest,
  AuthResponse,
  ApiResponse,
} from '../types';

export const authApi = {
  adminLogin: (data: AdminLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/admin/login', data),

  tableSetup: (data: TableSetupRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/table/setup', data),

  tableAutoLogin: (data: TableAutoLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/table/auto-login', data),

  refreshToken: (data: TokenRefreshRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/token/refresh', data),
};
