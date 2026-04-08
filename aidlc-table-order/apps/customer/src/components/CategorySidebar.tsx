import type { Category } from '@table-order/shared';
import styles from './CategorySidebar.module.css';

interface CategorySidebarProps {
  categories: Category[];
  activeCategoryId: string | null;
  onCategoryClick: (categoryId: string) => void;
}

export function CategorySidebar({
  categories,
  activeCategoryId,
  onCategoryClick,
}: CategorySidebarProps) {
  return (
    <nav className={styles.sidebar} data-testid="category-sidebar">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${styles.item} ${
            activeCategoryId === category.id ? styles.active : ''
          }`}
          onClick={() => onCategoryClick(category.id)}
          data-testid={`category-sidebar-${category.id}`}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}
