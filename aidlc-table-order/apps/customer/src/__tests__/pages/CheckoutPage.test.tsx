import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { CartProvider } from '../../contexts/CartContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { saveCart, type CartItem } from '@table-order/shared';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderCheckout(cartItems: CartItem[] = []) {
  saveCart(cartItems);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ErrorProvider>
          <CartProvider>
            <CheckoutPage />
          </CartProvider>
        </ErrorProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const sampleItems: CartItem[] = [
  {
    cart_item_id: 'cart-001',
    menu_id: 'menu-001',
    menu_name: '김치찌개',
    unit_price: 9000,
    quantity: 1,
    options: [],
    option_total_price: 0,
  },
  {
    cart_item_id: 'cart-002',
    menu_id: 'menu-003',
    menu_name: '제육볶음',
    unit_price: 10000,
    quantity: 2,
    options: [
      {
        option_item_id: 'oi-004',
        option_group_name: '토핑 추가',
        option_item_name: '치즈',
        extra_price: 1500,
      },
    ],
    option_total_price: 1500,
  },
];

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('장바구니 항목들이 표시된다', () => {
    renderCheckout(sampleItems);

    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('제육볶음')).toBeInTheDocument();
  });

  it('합계가 올바르게 표시된다', () => {
    renderCheckout(sampleItems);

    // 9000 + (10000 + 1500) * 2 = 32,000원
    const totalEl = screen.getByTestId('checkout-total-amount');
    expect(totalEl).toHaveTextContent('32,000원');
  });

  it('계산 안내 멘트가 표시된다', () => {
    renderCheckout(sampleItems);

    expect(
      screen.getByTestId('checkout-payment-notice'),
    ).toHaveTextContent('계산은 매장 나가기 할 때 프론트에서 해주세요');
  });

  it('주문 확정 버튼이 표시된다', () => {
    renderCheckout(sampleItems);

    expect(
      screen.getByTestId('checkout-confirm-button'),
    ).toBeInTheDocument();
  });
});
