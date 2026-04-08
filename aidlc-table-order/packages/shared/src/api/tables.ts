import { apiClient } from './client';
import type {
  Table,
  TableCompleteResponse,
  TableHistoryQuery,
  OrderHistory,
  ApiResponse,
} from '../types';

export const tablesApi = {
  getTables: () =>
    apiClient.get<ApiResponse<Table[]>>('/tables'),

  completeTable: (tableId: string) =>
    apiClient.post<ApiResponse<TableCompleteResponse>>(`/tables/${tableId}/complete`),

  getHistory: (tableId: string, query?: TableHistoryQuery) =>
    apiClient.get<ApiResponse<OrderHistory[]>>(`/tables/${tableId}/history`, { params: query }),
};
