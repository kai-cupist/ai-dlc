import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenusByCategory } from '../hooks/useMenus';
import { useCart } from '../contexts/CartContext';
import { CategorySidebar } from '../components/CategorySidebar';
import { MenuSection } from '../components/MenuSection';
import { AddedTooltip } from '../components/AddedTooltip';
import { ErrorFallback } from '../components/ErrorFallback';
import { formatPrice } from '@table-order/shared';
import styles from './MenuPage.module.css';

export function MenuPage() {
  const { data: menusByCategory, isLoading, isError, refetch } = useMenusByCategory();
  const { totalCount, totalAmount } = useCart();
  const navigate = useNavigate();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const registerSectionRef = useCallback(
    (categoryId: string, el: HTMLDivElement | null) => {
      if (el) {
        sectionRefs.current.set(categoryId, el);
      } else {
        sectionRefs.current.delete(categoryId);
      }
    },
    [],
  );

  useEffect(() => {
    if (!menusByCategory?.length) return;
    setActiveCategoryId(menusByCategory[0].category.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-category-id');
            if (id) setActiveCategoryId(id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [menusByCategory]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    const el = sectionRefs.current.get(categoryId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveCategoryId(categoryId);
  }, []);

  const handleAddedToCart = useCallback(() => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  }, []);

  if (isError) {
    return <ErrorFallback onRetry={refetch} />;
  }

  if (isLoading || !menusByCategory) {
    return (
      <div className={styles.loading} data-testid="menu-page-loading">
        메뉴를 불러오는 중...
      </div>
    );
  }

  const categories = menusByCategory.map((m) => m.category);

  return (
    <div className={styles.container} data-testid="menu-page">
      <div className={styles.content}>
        <CategorySidebar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategoryClick={handleCategoryClick}
        />
        <div className={styles.menuList} ref={scrollContainerRef}>
          {menusByCategory.map((group) => (
            <MenuSection
              key={group.category.id}
              category={group.category}
              menus={group.menus}
              ref={(el) => registerSectionRef(group.category.id, el)}
              onAddedToCart={handleAddedToCart}
            />
          ))}
        </div>
      </div>

      {totalCount > 0 && (
        <div className={styles.cartBar}>
          {showTooltip && <AddedTooltip />}
          <button
            className={styles.cartButton}
            onClick={() => navigate('/cart')}
            data-testid="menu-cart-button"
          >
            <span className={styles.cartBadge} data-testid="menu-cart-badge">
              {totalCount}
            </span>
            <span>장바구니 보기</span>
            <span className={styles.cartTotal}>{formatPrice(totalAmount)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
