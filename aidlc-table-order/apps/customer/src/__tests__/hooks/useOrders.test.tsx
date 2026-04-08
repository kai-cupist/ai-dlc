import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useCreateOrder, useSessionOrders } from '../../hooks/useOrders';
import { ordersApi } from '@table-order/shared';
import { vi } from 'vitest';

vi.mock('@table-order/shared', async () => {
  const actual = await vi.importActual('@table-order/shared');
  return {
    ...actual,
    ordersApi: {
      createOrder: vi.fn(),
      getSessionOrders: vi.fn(),
      getOrderProgress: vi.fn(),
    },
  };
});

const mockOrdersApi = ordersApi as {
  createOrder: ReturnType<typeof vi.fn>;
  getSessionOrders: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useCreateOrder', () => {
  it('주문을 생성한다', async () => {
    const mockOrder = {
      id: 'order-001',
      order_number: '20260408-0001',
      round: 1,
      status: 'pending',
      total_amount: 9000,
    };

    mockOrdersApi.createOrder.mockResolvedValueOnce({
      data: { data: mockOrder },
    });

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    let order: typeof mockOrder | undefined;
    await waitFor(async () => {
      order = await result.current.mutateAsync({
        items: [{ menu_id: 'menu-001', quantity: 1, options: [] }],
      });
    });

    expect(order!.order_number).toBe('20260408-0001');
    expect(mockOrdersApi.createOrder).toHaveBeenCalledWith({
      items: [{ menu_id: 'menu-001', quantity: 1, options: [] }],
    });
  });
});

describe('useSessionOrders', () => {
  it('세션 주문 목록을 가져온다', async () => {
    const mockData = {
      orders: [
        {
          id: 'order-001',
          order_number: '20260408-0001',
          round: 1,
          status: 'pending',
          total_amount: 9000,
          items: [],
        },
      ],
      total_amount: 9000,
    };

    mockOrdersApi.getSessionOrders.mockResolvedValueOnce({
      data: { data: mockData },
    });

    const { result } = renderHook(() => useSessionOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.orders).toHaveLength(1);
    expect(result.current.data!.total_amount).toBe(9000);
  });
});
