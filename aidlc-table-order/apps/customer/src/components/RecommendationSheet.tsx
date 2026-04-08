import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@table-order/shared';
import { useRecommendations } from '../hooks/useRecommendations';
import { useCart } from '../contexts/CartContext';
import styles from './RecommendationSheet.module.css';

interface RecommendationSheetProps {
  menuIds: string[];
  onSkip: () => void;
  onClose: () => void;
}

export function RecommendationSheet({
  menuIds,
  onSkip,
  onClose,
}: RecommendationSheetProps) {
  const { data, isLoading } = useRecommendations(menuIds);
  const { addItem } = useCart();
  const navigate = useNavigate();

  // 추천이 없거나 로딩 실패 시 바로 주문 확정으로
  if (!isLoading && (!data || data.recommendations.length === 0)) {
    onSkip();
    return null;
  }

  const handleAddRecommendation = (menu: {
    id: string;
    name: string;
    price: number;
  }) => {
    addItem({
      menu_id: menu.id,
      menu_name: menu.name,
      unit_price: menu.price,
      quantity: 1,
      options: [],
      option_total_price: 0,
    });
  };

  const handleOrderNow = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={styles.overlay} data-testid="recommendation-sheet">
      <div className={styles.backdrop} onClick={onSkip} />
      <div className={styles.sheet}>
        <h3 className={styles.title}>이 메뉴는 어떠세요?</h3>
        <p className={styles.subtitle}>
          다른 고객들이 함께 주문한 메뉴입니다
        </p>

        {isLoading ? (
          <div className={styles.loading}>추천 메뉴를 불러오는 중...</div>
        ) : (
          <div className={styles.list}>
            {data?.recommendations.map((menu) => (
              <div key={menu.id} className={styles.item}>
                <div className={styles.itemImageWrapper}>
                  {menu.image_url ? (
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImagePlaceholder} />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{menu.name}</span>
                  <span className={styles.itemPrice}>
                    {formatPrice(menu.price)}
                  </span>
                </div>
                <button
                  className={styles.addButton}
                  onClick={() => handleAddRecommendation(menu)}
                  data-testid={`recommendation-add-${menu.id}`}
                >
                  추가
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.orderButton}
            onClick={handleOrderNow}
            data-testid="recommendation-order-now"
          >
            바로 주문하기
          </button>
          <button
            className={styles.skipButton}
            onClick={onSkip}
            data-testid="recommendation-skip"
          >
            추천 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
