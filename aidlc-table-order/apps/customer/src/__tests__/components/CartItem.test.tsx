import { render, screen, fireEvent } from '@testing-library/react';
import { CartItemCard } from '../../components/CartItem';
import { CartProvider } from '../../contexts/CartContext';
import type { CartItem } from '@table-order/shared';

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

const sampleCartItem: CartItem = {
  cart_item_id: 'cart-001',
  menu_id: 'menu-001',
  menu_name: '김치찌개',
  unit_price: 9000,
  quantity: 2,
  options: [
    {
      option_item_id: 'oi-001',
      option_group_name: '맵기',
      option_item_name: '매운맛',
      extra_price: 0,
    },
  ],
  option_total_price: 0,
};

describe('CartItemCard', () => {
  it('메뉴명과 옵션이 표시된다', () => {
    renderWithCart(<CartItemCard item={sampleCartItem} />);

    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('매운맛')).toBeInTheDocument();
  });

  it('소계가 올바르게 표시된다', () => {
    renderWithCart(<CartItemCard item={sampleCartItem} />);

    // (9000 + 0) * 2 = 18,000원
    expect(screen.getByText('18,000원')).toBeInTheDocument();
  });

  it('수량이 올바르게 표시된다', () => {
    renderWithCart(<CartItemCard item={sampleCartItem} />);

    expect(screen.getByTestId('quantity-value')).toHaveTextContent('2');
  });

  it('삭제 버튼이 렌더링된다', () => {
    renderWithCart(<CartItemCard item={sampleCartItem} />);

    expect(
      screen.getByTestId(`cart-item-delete-${sampleCartItem.cart_item_id}`),
    ).toBeInTheDocument();
  });

  it('data-testid가 올바르게 설정된다', () => {
    renderWithCart(<CartItemCard item={sampleCartItem} />);

    expect(
      screen.getByTestId(`cart-item-${sampleCartItem.cart_item_id}`),
    ).toBeInTheDocument();
  });
});
