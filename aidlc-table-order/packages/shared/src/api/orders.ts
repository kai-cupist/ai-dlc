import { apiClient } from './client';
import type {
  CreateOrderRequest,
  OrderWithItems,
  SessionOrdersResponse,
  UpdateOrderStatusRequest,
  PollingResponse,
  ReceiptResponse,
  OrderProgressResponse,
  ApiResponse,
} from '../types';

export const ordersApi = {
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<OrderWithItems>>('/orders', data),

  getSessionOrders: () =>
    apiClient.get<ApiResponse<SessionOrdersResponse>>('/orders'),

  updateOrderStatus: (orderId: string, data: UpdateOrderStatusRequest) =>
    apiClient.patch<ApiResponse<OrderWithItems>>(`/orders/${orderId}/status`, data),

  deleteOrder: (orderId: string) =>
    apiClient.delete(`/orders/${orderId}`),

  getPollingData: (since?: string) =>
    apiClient.get<ApiResponse<PollingResponse>>('/orders/polling', {
      params: since ? { since } : undefined,
    }),

  getReceipt: () =>
    apiClient.get<ApiResponse<ReceiptResponse>>('/orders/receipt'),

  getOrderProgress: (orderId: string) =>
    apiClient.get<ApiResponse<OrderProgressResponse>>(`/orders/${orderId}/progress`),
};
