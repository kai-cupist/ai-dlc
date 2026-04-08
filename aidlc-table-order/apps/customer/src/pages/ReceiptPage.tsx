import { useNavigate } from 'react-router-dom';
import { formatPrice, formatTime } from '@table-order/shared';
import { useReceipt } from '../hooks/useReceipt';
import { RoundBadge } from '../components/RoundBadge';
import { ErrorFallback } from '../components/ErrorFallback';
import styles from './ReceiptPage.module.css';

export function ReceiptPage() {
  const { data: receipt, isLoading, isError, refetch } = useReceipt();
  const navigate = useNavigate();

  if (isError) {
    return <ErrorFallback onRetry={refetch} />;
  }

  if (isLoading || !receipt) {
    return (
      <div className={styles.loading}>영수증을 불러오는 중...</div>
    );
  }

  return (
    <div className={styles.container} data-testid="receipt-page">
      <div className={styles.header}>
        <h2 className={styles.title}>영수증</h2>
        <span className={styles.tableInfo}>
          테이블 {receipt.table_number}
        </span>
      </div>

      <div className={styles.rounds}>
        {receipt.rounds.map((round) => (
          <div
            key={round.round}
            className={styles.round}
            data-testid={`receipt-round-${round.round}`}
          >
            <div className={styles.roundHeader}>
              <RoundBadge round={round.round} />
              <span className={styles.roundTime}>
                {formatTime(round.ordered_at)}
              </span>
              <span className={styles.roundOrderNumber}>
                #{round.order_number}
              </span>
            </div>
            <div className={styles.items}>
              {round.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <span className={styles.itemName}>
                      {item.menu_name}
                    </span>
                    <span className={styles.itemQuantity}>
                      x{item.quantity}
                    </span>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                  {item.options.length > 0 && (
                    <p className={styles.itemOptions}>
                      {item.options
                        .map((opt) => opt.option_item_name)
                        .join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.roundTotal}>
              <span>소계</span>
              <span>{formatPrice(round.round_total)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <span className={styles.totalLabel}>총 합계</span>
        <span
          className={styles.totalAmount}
          data-testid="receipt-total-amount"
        >
          {formatPrice(receipt.total_amount)}
        </span>
      </div>

      <button
        className={styles.backButton}
        onClick={() => navigate(-1)}
        data-testid="receipt-back-button"
      >
        돌아가기
      </button>
    </div>
  );
}
