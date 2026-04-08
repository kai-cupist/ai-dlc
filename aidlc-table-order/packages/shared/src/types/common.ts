export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface ErrorResponse {
  detail: string;
  field_errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';
export type SessionStatus = 'active' | 'completed';
export type UserRole = 'admin' | 'table';
