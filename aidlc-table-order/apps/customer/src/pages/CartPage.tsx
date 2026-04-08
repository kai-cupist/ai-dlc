import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@table-order/shared';
import { useCart } from '../contexts/CartContext';
import { CartItemCard } from '../components/CartItem';
import { RecommendationSheet } from '../components/RecommendationSheet';
import styles from './CartPage.module.css';

export function CartPage() {
  const { items, totalAmount, totalCount, clearAll } = useCart();
  const navigate = useNavigate();
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleOrder = () => {
    setShowRecommendation(true);
  };

  const handleSkipRecommendation = () => {
    setShowRecommendation(false);
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty} data-testid="cart-empty">
        <p className={styles.emptyText}>장바구니가 비어있습니다</p>
        <button
          className={styles.browseButton}
          onClick={() => navigate('/')}
          data-testid="cart-browse-button"
        >
          메뉴 보러가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="cart-page">
      <div className={styles.header}>
        <h2 className={styles.title}>장바구니</h2>
        <button
          className={styles.clearButton}
          onClick={clearAll}
          data-testid="cart-clear-button"
        >
          전체 삭제
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <CartItemCard key={item.cart_item_id} item={item} />
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>총 {totalCount}개</span>
          <span className={styles.summaryTotal} data-testid="cart-total-amount">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.orderButton}
          onClick={handleOrder}
          data-testid="cart-order-button"
        >
          주문하기
        </button>
      </div>

      {showRecommendation && (
        <RecommendationSheet
          menuIds={items.map((i) => i.menu_id)}
          onSkip={handleSkipRecommendation}
          onClose={() => setShowRecommendation(false)}
        />
      )}
    </div>
  );
}
