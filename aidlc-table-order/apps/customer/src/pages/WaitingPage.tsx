import { useNavigate, useLocation } from 'react-router-dom';
import { useOrderProgress, useSessionOrders } from '../hooks/useOrders';
import { OrderProgress } from '../components/OrderProgress';
import { HourglassAnimation } from '../components/HourglassAnimation';
import styles from './WaitingPage.module.css';

export function WaitingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    orderNumber?: string;
    orderId?: string;
  } | null;

  const { data: sessionData } = useSessionOrders();
  const latestOrderId =
    state?.orderId ||
    (sessionData?.orders.length
      ? sessionData.orders[sessionData.orders.length - 1].id
      : null);

  const { data: progress } = useOrderProgress(latestOrderId);

  const latestOrder = sessionData?.orders.length
    ? sessionData.orders[sessionData.orders.length - 1]
    : null;

  return (
    <div className={styles.container} data-testid="waiting-page">
      {state?.orderNumber && (
        <div className={styles.orderInfo}>
          <span className={styles.orderLabel}>주문번호</span>
          <span
            className={styles.orderNumber}
            data-testid="waiting-order-number"
          >
            {state.orderNumber}
          </span>
        </div>
      )}

      <div className={styles.progressSection}>
        <OrderProgress
          status={latestOrder?.status || 'pending'}
        />
      </div>

      {progress && latestOrder?.status === 'preparing' && (
        <div className={styles.hourglassSection} data-testid="waiting-progress">
          <HourglassAnimation percent={progress.progress_percent} />
        </div>
      )}

      <div className={styles.message}>
        {latestOrder?.status === 'pending' && '주문이 접수되었습니다'}
        {latestOrder?.status === 'preparing' && '음식을 준비하고 있습니다'}
        {latestOrder?.status === 'completed' && '음식이 준비되었습니다!'}
        {!latestOrder && '주문 정보를 불러오는 중...'}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.receiptButton}
          onClick={() => navigate('/receipt')}
          data-testid="waiting-receipt-button"
        >
          영수증 보기
        </button>
        <button
          className={styles.additionalButton}
          onClick={() => navigate('/')}
          data-testid="waiting-additional-order-button"
        >
          추가 주문
        </button>
      </div>
    </div>
  );
}
