const CART_KEY = 'table_order_cart';

export interface CartItem {
  menu_id: string;
  menu_name: string;
  unit_price: number;
  quantity: number;
  options: CartItemOption[];
  option_total_price: number;
  cart_item_id: string;
}

export interface CartItemOption {
  option_item_id: string;
  option_group_name: string;
  option_item_name: string;
  extra_price: number;
}

export function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
