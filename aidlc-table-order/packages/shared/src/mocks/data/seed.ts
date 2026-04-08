import type {
  Store, Category, Menu, OptionGroupWithItems,
  Order, OrderItem, OrderItemOption, PollingTableData,
} from '../../types';

export const mockStore: Store = {
  id: 'store-001',
  name: '맛있는 식당',
  default_prep_time_minutes: 15,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockCategories: Category[] = [
  { id: 'cat-001', store_id: 'store-001', name: '메인 메뉴', sort_order: 0 },
  { id: 'cat-002', store_id: 'store-001', name: '사이드', sort_order: 1 },
  { id: 'cat-003', store_id: 'store-001', name: '음료', sort_order: 2 },
];

export const mockOptionGroups: OptionGroupWithItems[] = [
  {
    id: 'og-001', store_id: 'store-001', name: '맵기', is_required: true, created_at: '2026-01-01T00:00:00Z',
    items: [
      { id: 'oi-001', option_group_id: 'og-001', name: '순한맛', extra_price: 0, sort_order: 0 },
      { id: 'oi-002', option_group_id: 'og-001', name: '보통맛', extra_price: 0, sort_order: 1 },
      { id: 'oi-003', option_group_id: 'og-001', name: '매운맛', extra_price: 0, sort_order: 2 },
    ],
  },
  {
    id: 'og-002', store_id: 'store-001', name: '토핑 추가', is_required: false, created_at: '2026-01-01T00:00:00Z',
    items: [
      { id: 'oi-004', option_group_id: 'og-002', name: '치즈', extra_price: 1500, sort_order: 0 },
      { id: 'oi-005', option_group_id: 'og-002', name: '계란', extra_price: 1000, sort_order: 1 },
    ],
  },
];

export const mockMenus: Menu[] = [
  { id: 'menu-001', store_id: 'store-001', category_id: 'cat-001', name: '김치찌개', price: 9000, description: '진한 김치찌개', image_url: null, sort_order: 0, is_popular: true, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'menu-002', store_id: 'store-001', category_id: 'cat-001', name: '된장찌개', price: 8000, description: '구수한 된장찌개', image_url: null, sort_order: 1, is_popular: false, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'menu-003', store_id: 'store-001', category_id: 'cat-001', name: '제육볶음', price: 10000, description: '매콤 제육볶음', image_url: null, sort_order: 2, is_popular: true, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'menu-004', store_id: 'store-001', category_id: 'cat-002', name: '계란말이', price: 5000, description: null, image_url: null, sort_order: 0, is_popular: false, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'menu-005', store_id: 'store-001', category_id: 'cat-003', name: '콜라', price: 2000, description: null, image_url: null, sort_order: 0, is_popular: false, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'menu-006', store_id: 'store-001', category_id: 'cat-003', name: '사이다', price: 2000, description: null, image_url: null, sort_order: 1, is_popular: false, is_available: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

let orderCounter = 0;

export function createMockOrder(round: number = 1): Order {
  orderCounter++;
  return {
    id: `order-${String(orderCounter).padStart(3, '0')}`,
    store_id: 'store-001',
    table_id: 'table-001',
    session_id: 'session-001',
    order_number: `20260408-${String(orderCounter).padStart(4, '0')}`,
    round,
    status: 'pending',
    total_amount: 9000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function resetMockState() {
  orderCounter = 0;
}
