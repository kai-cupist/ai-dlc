import type { CartItem } from '@table-order/shared';
import { formatPrice } from '@table-order/shared';
import { useCart } from '../contexts/CartContext';
import { QuantitySelector } from './QuantitySelector';
import styles from './CartItem.module.css';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart();

  const subtotal = (item.unit_price + item.option_total_price) * item.quantity;

  return (
    <div className={styles.card} data-testid={`cart-item-${item.cart_item_id}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{item.menu_name}</h3>
        <button
          className={styles.deleteButton}
          onClick={() => removeItem(item.cart_item_id)}
          data-testid={`cart-item-delete-${item.cart_item_id}`}
        >
          &times;
        </button>
      </div>

      {item.options.length > 0 && (
        <p className={styles.options}>
          {item.options.map((opt) => opt.option_item_name).join(', ')}
        </p>
      )}

      <div className={styles.footer}>
        <QuantitySelector
          quantity={item.quantity}
          onChange={(q) => updateQuantity(item.cart_item_id, q)}
        />
        <span className={styles.subtotal}>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
