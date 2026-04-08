import type { OptionGroupWithItems, OptionItem } from '@table-order/shared';
import { formatPrice } from '@table-order/shared';
import styles from './OptionSelector.module.css';

interface OptionSelectorProps {
  group: OptionGroupWithItems;
  selectedItems: OptionItem[];
  onChange: (items: OptionItem[]) => void;
}

export function OptionSelector({
  group,
  selectedItems,
  onChange,
}: OptionSelectorProps) {
  const isRequired = group.is_required;
  const selectedIds = new Set(selectedItems.map((i) => i.id));

  const handleSelect = (item: OptionItem) => {
    if (isRequired) {
      // 라디오: 단일 선택
      onChange([item]);
    } else {
      // 체크박스: 다중 선택 토글
      if (selectedIds.has(item.id)) {
        onChange(selectedItems.filter((i) => i.id !== item.id));
      } else {
        onChange([...selectedItems, item]);
      }
    }
  };

  return (
    <div
      className={styles.group}
      data-testid={`option-group-${group.id}`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{group.name}</h3>
        {isRequired && (
          <span className={styles.requiredTag}>필수</span>
        )}
      </div>
      <div className={styles.items}>
        {group.items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              className={`${styles.item} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(item)}
              data-testid={`option-item-${item.id}`}
            >
              <span className={isRequired ? styles.radio : styles.checkbox}>
                {isSelected && (isRequired ? '\u25C9' : '\u2713')}
              </span>
              <span className={styles.itemName}>{item.name}</span>
              {item.extra_price > 0 && (
                <span className={styles.extraPrice}>
                  +{formatPrice(item.extra_price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
