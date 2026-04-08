import type { OrderStatus } from '@table-order/shared';
import styles from './OrderProgress.module.css';

interface OrderProgressProps {
  status: OrderStatus;
}

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: '주문 접수' },
  { key: 'preparing', label: '준비 중' },
  { key: 'completed', label: '서빙 대기' },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  completed: 2,
};

export function OrderProgress({ status }: OrderProgressProps) {
  const currentIndex = STATUS_INDEX[status];

  return (
    <div className={styles.container} data-testid="order-progress-bar">
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className={`${styles.dot} ${
              index <= currentIndex ? styles.dotActive : ''
            }`}
            style={{ left: `${(index / (STEPS.length - 1)) * 100}%` }}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {STEPS.map((step, index) => (
          <span
            key={step.key}
            className={`${styles.label} ${
              index <= currentIndex ? styles.labelActive : ''
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
