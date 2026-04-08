import { forwardRef } from 'react';
import type { Category, Menu } from '@table-order/shared';
import { MenuCard } from './MenuCard';
import styles from './MenuSection.module.css';

interface MenuSectionProps {
  category: Category;
  menus: Menu[];
  onAddedToCart: () => void;
}

export const MenuSection = forwardRef<HTMLDivElement, MenuSectionProps>(
  function MenuSection({ category, menus, onAddedToCart }, ref) {
    return (
      <div
        ref={ref}
        data-category-id={category.id}
        className={styles.section}
        data-testid={`menu-section-${category.id}`}
      >
        <h2 className={styles.title}>{category.name}</h2>
        <div className={styles.divider} />
        <div className={styles.grid}>
          {menus
            .filter((m) => m.is_available)
            .map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAddedToCart={onAddedToCart}
              />
            ))}
        </div>
      </div>
    );
  },
);
