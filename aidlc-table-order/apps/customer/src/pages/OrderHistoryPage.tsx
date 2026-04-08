import { formatPrice, formatTime } from '@table-order/shared';
import { useSessionOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { RoundBadge } from '../components/RoundBadge';
import { ErrorFallback } from '../components/ErrorFallback';
import styles from './OrderHistoryPage.module.css';

export function OrderHistoryPage() {
  const { data, isLoading, isError, refetch } = useSessionOrders();

  if (isError) {
    return <ErrorFallback onRetry={refetch} />;
  }

  if (isLoading || !data) {
    return (
      <div className={styles.loading}>주문 내역을 불러오는 중...</div>
    );
  }

  if (data.orders.length === 0) {
    return (
      <div className={styles.empty} data-testid="order-history-empty">
        아직 주문 내역이 없습니다
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="order-history-page">
      <h2 className={styles.title}>주문 내역</h2>

      <div className={styles.list}>
        {data.orders.map((order) => (
          <div
            key={order.id}
            className={styles.order}
            data-testid={`order-history-item-${order.id}`}
          >
            <div className={styles.orderHeader}>
              <RoundBadge round={order.round} />
              <span className={styles.orderNumber}>
                #{order.order_number}
              </span>
              <span className={styles.orderTime}>
                {formatTime(order.created_at)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className={styles.items}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span className={styles.itemName}>{item.menu_name}</span>
                  {item.options.length > 0 && (
                    <span className={styles.itemOptions}>
                      ({item.options.map((o) => o.option_item_name).join(', ')})
                    </span>
                  )}
                  <span className={styles.itemQuantity}>x{item.quantity}</span>
                  <span className={styles.itemPrice}>
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <span className={styles.totalLabel}>총 주문 금액</span>
        <span
          className={styles.totalAmount}
          data-testid="order-history-total"
        >
          {formatPrice(data.total_amount)}
        </span>
      </div>
    </div>
  );
}
