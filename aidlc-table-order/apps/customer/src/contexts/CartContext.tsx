import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type CartItem,
  type CartItemOption,
  loadCart,
  saveCart,
  clearCart as clearStorageCart,
  generateCartItemId,
} from '@table-order/shared';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'cart_item_id'> }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { cartItemId: string } }
  | { type: 'CLEAR_ALL' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        cart_item_id: generateCartItemId(),
      };
      return { items: [...state.items, newItem] };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity < 1) {
        return {
          items: state.items.filter(
            (item) => item.cart_item_id !== action.payload.cartItemId,
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.cart_item_id === action.payload.cartItemId
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) => item.cart_item_id !== action.payload.cartItemId,
        ),
      };
    case 'CLEAR_ALL':
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  totalCount: number;
  addItem: (item: Omit<CartItem, 'cart_item_id'>) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearAll: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => ({
    items: loadCart(),
  }));

  useEffect(() => {
    saveCart(state.items);
  }, [state.items]);

  const totalAmount = useMemo(
    () =>
      state.items.reduce(
        (sum, item) =>
          sum + (item.unit_price + item.option_total_price) * item.quantity,
        0,
      ),
    [state.items],
  );

  const totalCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );

  const addItem = useCallback(
    (item: Omit<CartItem, 'cart_item_id'>) =>
      dispatch({ type: 'ADD_ITEM', payload: item }),
    [],
  );

  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } }),
    [],
  );

  const removeItem = useCallback(
    (cartItemId: string) =>
      dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId } }),
    [],
  );

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    clearStorageCart();
  }, []);

  const value: CartContextValue = {
    items: state.items,
    totalAmount,
    totalCount,
    addItem,
    updateQuantity,
    removeItem,
    clearAll,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
