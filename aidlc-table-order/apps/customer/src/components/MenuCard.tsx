import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Menu } from '@table-order/shared';
import { formatPrice } from '@table-order/shared';
import { useCart } from '../contexts/CartContext';
import { useMenuDetail } from '../hooks/useMenus';
import styles from './MenuCard.module.css';

interface MenuCardProps {
  menu: Menu;
  onAddedToCart: () => void;
}

export function MenuCard({ menu, onAddedToCart }: MenuCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleClick = useCallback(() => {
    // 옵션이 있는지 확인하기 위해 상세 API를 호출하는 대신,
    // 상세 페이지로 이동시키고 거기서 옵션 유무에 따라 처리
    // 단, 빠른 추가를 위해 prefetch된 데이터가 있으면 사용
    navigate(`/menu/${menu.id}`);
  }, [menu.id, navigate]);

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      data-testid={`menu-card-${menu.id}`}
    >
      <div className={styles.imageWrapper}>
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        {menu.is_popular && (
          <span className={styles.popularBadge} data-testid={`popular-badge-${menu.id}`}>
            인기
          </span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{menu.name}</h3>
        {menu.description && (
          <p className={styles.description}>{menu.description}</p>
        )}
        <span className={styles.price}>{formatPrice(menu.price)}</span>
      </div>
    </button>
  );
}
