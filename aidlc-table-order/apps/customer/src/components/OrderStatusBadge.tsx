import type { OrderStatus } from '@table-order/shared';
import styles from './OrderStatusBadge.module.css';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '대기중', className: 'pending' },
  preparing: { label: '준비중', className: 'preparing' },
  completed: { label: '완료', className: 'completed' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span
      className={`${styles.badge} ${styles[className]}`}
      data-testid={`order-status-${status}`}
    >
      {label}
    </span>
  );
}
