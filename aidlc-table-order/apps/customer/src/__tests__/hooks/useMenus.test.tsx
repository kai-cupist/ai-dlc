import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useMenusByCategory, useMenuDetail } from '../../hooks/useMenus';
import { menusApi } from '@table-order/shared';
import { vi } from 'vitest';

vi.mock('@table-order/shared', async () => {
  const actual = await vi.importActual('@table-order/shared');
  return {
    ...actual,
    menusApi: {
      getMenus: vi.fn(),
      getMenuDetail: vi.fn(),
      getCategories: vi.fn(),
    },
  };
});

const mockMenusApi = menusApi as {
  getMenus: ReturnType<typeof vi.fn>;
  getMenuDetail: ReturnType<typeof vi.fn>;
  getCategories: ReturnType<typeof vi.fn>;
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

describe('useMenusByCategory', () => {
  it('카테고리별 메뉴 목록을 가져온다', async () => {
    const mockData = [
      {
        category: { id: 'cat-001', store_id: 'store-001', name: '메인 메뉴', sort_order: 0 },
        menus: [
          { id: 'menu-001', name: '김치찌개', price: 9000, is_popular: true },
        ],
      },
    ];

    mockMenusApi.getMenus.mockResolvedValueOnce({
      data: { data: mockData },
    });

    const { result } = renderHook(() => useMenusByCategory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].category.name).toBe('메인 메뉴');
  });

  it('API 에러 시 에러 상태를 반환한다', async () => {
    mockMenusApi.getMenus.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useMenusByCategory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useMenuDetail', () => {
  it('메뉴 상세 정보를 가져온다', async () => {
    const mockDetail = {
      id: 'menu-001',
      name: '김치찌개',
      price: 9000,
      option_groups: [
        {
          id: 'og-001',
          name: '맵기',
          is_required: true,
          items: [{ id: 'oi-001', name: '순한맛', extra_price: 0 }],
        },
      ],
    };

    mockMenusApi.getMenuDetail.mockResolvedValueOnce({
      data: { data: mockDetail },
    });

    const { result } = renderHook(() => useMenuDetail('menu-001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.name).toBe('김치찌개');
    expect(result.current.data!.option_groups).toHaveLength(1);
  });
});
