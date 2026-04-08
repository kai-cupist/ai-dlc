import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@table-order/shared';
import { useError } from '../contexts/ErrorContext';
import { ErrorBanner } from '../components/ErrorBanner';
import styles from './CustomerLayout.module.css';

export function CustomerLayout() {
  const { isAuthenticated, tableId } = useAuth();
  const { error } = useError();
  const navigate = useNavigate();

  const tableNumber = tableId ? `T${tableId.replace(/\D/g, '')}` : '';

  return (
    <div className={styles.layout} data-testid="customer-layout">
      <header className={styles.header}>
        <h1
          className={styles.logo}
          onClick={() => navigate('/')}
          data-testid="header-logo"
        >
          테이블오더
        </h1>
        {isAuthenticated && tableNumber && (
          <span className={styles.tableNumber} data-testid="header-table-number">
            {tableNumber}
          </span>
        )}
        <nav className={styles.nav}>
          <button
            className={styles.navButton}
            onClick={() => navigate('/orders')}
            data-testid="header-orders-button"
          >
            주문내역
          </button>
        </nav>
      </header>
      {error && <ErrorBanner />}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
