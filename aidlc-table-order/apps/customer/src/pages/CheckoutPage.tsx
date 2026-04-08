import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@table-order/shared';
import type { OrderItemRequest } from '@table-order/shared';
import { useCart } from '../contexts/CartContext';
import { useCreateOrder } from '../hooks/useOrders';
import { useError } from '../contexts/ErrorContext';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { items, totalAmount, clearAll } = useCart();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();
  const { showError } = useError();

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    const orderItems: OrderItemRequest[] = items.map((item) => ({
      menu_id: item.menu_id,
      quantity: item.quantity,
      options: item.options.map((opt) => ({
        option_item_id: opt.option_item_id,
      })),
    }));

    try {
      const order = await createOrder.mutateAsync({ items: orderItems });
      clearAll();
      navigate('/waiting', {
        replace: true,
        state: { orderNumber: order.order_number, orderId: order.id },
      });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (!axiosError.response) {
        showError('network', '네트워크 연결을 확인해 주세요');
      } else {
        showError('server', '주문에 실패했습니다. 다시 시도해 주세요');
      }
    }
  };

  if (items.length === 0) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className={styles.container} data-testid="checkout-page">
      <h2 className={styles.title}>주문 확인</h2>

      <div className={styles.list}>
        {items.map((item) => {
          const subtotal =
            (item.unit_price + item.option_total_price) * item.quantity;
          return (
            <div
              key={item.cart_item_id}
              className={styles.item}
              data-testid={`checkout-item-${item.cart_item_id}`}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{item.menu_name}</span>
                <span className={styles.itemQuantity}>x{item.quantity}</span>
              </div>
              {item.options.length > 0 && (
                <p className={styles.itemOptions}>
                  {item.options.map((opt) => opt.option_item_name).join(', ')}
                </p>
              )}
              <span className={styles.itemPrice}>{formatPrice(subtotal)}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>합계</span>
        <span className={styles.totalAmount} data-testid="checkout-total-amount">
          {formatPrice(totalAmount)}
        </span>
      </div>

      <div className={styles.notice} data-testid="checkout-payment-notice">
        계산은 매장 나가기 할 때 프론트에서 해주세요
      </div>

      <div className={styles.footer}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/cart')}
          data-testid="checkout-back-button"
        >
          장바구니로
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleConfirmOrder}
          disabled={createOrder.isPending}
          data-testid="checkout-confirm-button"
        >
          {createOrder.isPending ? '주문 중...' : '주문 확정'}
        </button>
      </div>
    </div>
  );
}
