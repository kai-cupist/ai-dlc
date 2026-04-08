import type { OrderStatus } from './common';

export interface OrderItemOptionRequest {
  option_item_id: string;
}

export interface OrderItemRequest {
  menu_id: string;
  quantity: number;
  options: OrderItemOptionRequest[];
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface Order {
  id: string;
  store_id: string;
  table_id: string;
  session_id: string;
  order_number: string;
  round: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItemOption {
  id: string;
  option_group_name: string;
  option_item_name: string;
  extra_price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  option_total_price: number;
  subtotal: number;
  options: OrderItemOption[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface SessionOrdersResponse {
  orders: OrderWithItems[];
  total_amount: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface ReceiptResponse {
  session_id: string;
  table_number: number;
  rounds: ReceiptRound[];
  total_amount: number;
}

export interface ReceiptRound {
  round: number;
  order_number: string;
  ordered_at: string;
  items: OrderItem[];
  round_total: number;
}

export interface PollingTableData {
  table_id: string;
  table_number: number;
  session_id: string | null;
  total_amount: number;
  recent_orders: PollingOrderPreview[];
  has_new: boolean;
}

export interface PollingOrderPreview {
  order_id: string;
  order_number: string;
  round: number;
  status: OrderStatus;
  summary: string;
  total_amount: number;
  created_at: string;
}

export interface PollingResponse {
  tables: PollingTableData[];
  timestamp: string;
}

export interface OrderProgressResponse {
  order_id: string;
  status: OrderStatus;
  estimated_total_seconds: number;
  elapsed_seconds: number;
  progress_percent: number;
}

export interface OrderHistory {
  id: string;
  original_order_id: string;
  store_id: string;
  table_id: string;
  session_id: string;
  order_number: string;
  round: number;
  total_amount: number;
  items_snapshot: OrderItem[];
  ordered_at: string;
  archived_at: string;
}
