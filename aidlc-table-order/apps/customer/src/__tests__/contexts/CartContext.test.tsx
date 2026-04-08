import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { clearCart as clearStorageCart } from '@table-order/shared';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
  clearStorageCart();
});

describe('CartContext', () => {
  const sampleItem = {
    menu_id: 'menu-001',
    menu_name: '김치찌개',
    unit_price: 9000,
    quantity: 1,
    options: [],
    option_total_price: 0,
  };

  it('addItem으로 장바구니에 항목을 추가할 수 있다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].menu_name).toBe('김치찌개');
    expect(result.current.totalAmount).toBe(9000);
    expect(result.current.totalCount).toBe(1);
  });

  it('updateQuantity로 수량을 변경할 수 있다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
    });

    const cartItemId = result.current.items[0].cart_item_id;

    act(() => {
      result.current.updateQuantity(cartItemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalAmount).toBe(27000);
    expect(result.current.totalCount).toBe(3);
  });

  it('removeItem으로 항목을 삭제할 수 있다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
    });

    const cartItemId = result.current.items[0].cart_item_id;

    act(() => {
      result.current.removeItem(cartItemId);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('clearAll로 전체 장바구니를 비울 수 있다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
      result.current.addItem({ ...sampleItem, menu_id: 'menu-002', menu_name: '된장찌개' });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('옵션이 있는 항목의 총 금액이 올바르게 계산된다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        ...sampleItem,
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
      });
    });

    // (9000 + 1500) * 2 = 21000
    expect(result.current.totalAmount).toBe(21000);
  });

  it('localStorage에 장바구니가 동기화된다', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem);
    });

    const stored = JSON.parse(localStorage.getItem('table_order_cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].menu_name).toBe('김치찌개');
  });
});
