import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps {
  onRetry: () => void;
}

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div className={styles.container} data-testid="error-fallback">
      <p className={styles.message}>
        서버 응답이 없습니다.
        <br />
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        className={styles.retryButton}
        onClick={onRetry}
        data-testid="error-fallback-retry"
      >
        재시도
      </button>
    </div>
  );
}
