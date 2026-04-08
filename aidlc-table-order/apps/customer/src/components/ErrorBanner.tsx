import { useError } from '../contexts/ErrorContext';
import styles from './ErrorBanner.module.css';

export function ErrorBanner() {
  const { error, clearError } = useError();

  if (!error) return null;

  return (
    <div
      className={`${styles.banner} ${styles[error.type || 'network']}`}
      data-testid="error-banner"
      role="alert"
    >
      <span className={styles.message}>{error.message}</span>
      <button
        className={styles.close}
        onClick={clearError}
        data-testid="error-banner-close"
        aria-label="닫기"
      >
        &times;
      </button>
    </div>
  );
}
