import { apiClient } from './client';
import type { Store, ApiResponse } from '../types';

export const storesApi = {
  getStore: (storeId: string) =>
    apiClient.get<ApiResponse<Store>>(`/stores/${storeId}`),
};
