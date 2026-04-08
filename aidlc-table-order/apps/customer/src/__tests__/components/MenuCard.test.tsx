import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuCard } from '../../components/MenuCard';
import { CartProvider } from '../../contexts/CartContext';
import type { Menu } from '@table-order/shared';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartProvider>{ui}</CartProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const baseMenu: Menu = {
  id: 'menu-001',
  store_id: 'store-001',
  category_id: 'cat-001',
  name: '김치찌개',
  price: 9000,
  description: '진한 김치찌개',
  image_url: null,
  sort_order: 0,
  is_popular: false,
  is_available: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('MenuCard', () => {
  it('메뉴 이름과 가격이 표시된다', () => {
    renderWithProviders(
      <MenuCard menu={baseMenu} onAddedToCart={() => {}} />,
    );

    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('9,000원')).toBeInTheDocument();
  });

  it('설명이 있으면 표시된다', () => {
    renderWithProviders(
      <MenuCard menu={baseMenu} onAddedToCart={() => {}} />,
    );

    expect(screen.getByText('진한 김치찌개')).toBeInTheDocument();
  });

  it('인기 메뉴에 인기 뱃지가 표시된다', () => {
    const popularMenu = { ...baseMenu, is_popular: true };
    renderWithProviders(
      <MenuCard menu={popularMenu} onAddedToCart={() => {}} />,
    );

    expect(
      screen.getByTestId(`popular-badge-${baseMenu.id}`),
    ).toBeInTheDocument();
    expect(screen.getByText('인기')).toBeInTheDocument();
  });

  it('인기 메뉴가 아니면 뱃지가 없다', () => {
    renderWithProviders(
      <MenuCard menu={baseMenu} onAddedToCart={() => {}} />,
    );

    expect(
      screen.queryByTestId(`popular-badge-${baseMenu.id}`),
    ).not.toBeInTheDocument();
  });

  it('data-testid가 올바르게 설정된다', () => {
    renderWithProviders(
      <MenuCard menu={baseMenu} onAddedToCart={() => {}} />,
    );

    expect(
      screen.getByTestId(`menu-card-${baseMenu.id}`),
    ).toBeInTheDocument();
  });
});
