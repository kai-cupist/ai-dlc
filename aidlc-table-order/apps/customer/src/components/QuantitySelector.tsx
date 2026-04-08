import styles from './QuantitySelector.module.css';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
}: QuantitySelectorProps) {
  return (
    <div className={styles.selector} data-testid="quantity-selector">
      <button
        className={styles.button}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        data-testid="quantity-decrease"
      >
        -
      </button>
      <span className={styles.value} data-testid="quantity-value">
        {quantity}
      </span>
      <button
        className={styles.button}
        onClick={() => onChange(quantity + 1)}
        data-testid="quantity-increase"
      >
        +
      </button>
    </div>
  );
}
