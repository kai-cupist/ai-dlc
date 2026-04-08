import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatPrice } from '@table-order/shared';
import type { OptionItem, CartItemOption } from '@table-order/shared';
import { useMenuDetail } from '../hooks/useMenus';
import { useCart } from '../contexts/CartContext';
import { OptionSelector } from '../components/OptionSelector';
import { QuantitySelector } from '../components/QuantitySelector';
import { ErrorFallback } from '../components/ErrorFallback';
import styles from './MenuDetailPage.module.css';

export function MenuDetailPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const { data: menu, isLoading, isError, refetch } = useMenuDetail(menuId!);
  const { addItem } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<Map<string, OptionItem[]>>(
    new Map(),
  );
  const [quantity, setQuantity] = useState(1);
  const [requiredError, setRequiredError] = useState(false);

  // 옵션이 없는 메뉴인 경우 바로 장바구니에 추가하고 돌아감
  useEffect(() => {
    if (menu && menu.option_groups.length === 0) {
      addItem({
        menu_id: menu.id,
        menu_name: menu.name,
        unit_price: menu.price,
        quantity: 1,
        options: [],
        option_total_price: 0,
      });
      navigate('/', { replace: true });
    }
  }, [menu, addItem, navigate]);

  const optionTotalPrice = useMemo(() => {
    let total = 0;
    selectedOptions.forEach((items) => {
      items.forEach((item) => {
        total += item.extra_price;
      });
    });
    return total;
  }, [selectedOptions]);

  const totalPrice = useMemo(() => {
    if (!menu) return 0;
    return (menu.price + optionTotalPrice) * quantity;
  }, [menu, optionTotalPrice, quantity]);

  const handleOptionChange = useCallback(
    (groupId: string, items: OptionItem[]) => {
      setSelectedOptions((prev) => {
        const next = new Map(prev);
        next.set(groupId, items);
        return next;
      });
      setRequiredError(false);
    },
    [],
  );

  const handleAddToCart = useCallback(() => {
    if (!menu) return;

    // 필수 옵션 검증
    const missingRequired = menu.option_groups.some(
      (group) =>
        group.is_required &&
        (!selectedOptions.has(group.id) || selectedOptions.get(group.id)!.length === 0),
    );

    if (missingRequired) {
      setRequiredError(true);
      return;
    }

    const cartOptions: CartItemOption[] = [];
    selectedOptions.forEach((items, groupId) => {
      const group = menu.option_groups.find((g) => g.id === groupId);
      if (!group) return;
      items.forEach((item) => {
        cartOptions.push({
          option_item_id: item.id,
          option_group_name: group.name,
          option_item_name: item.name,
          extra_price: item.extra_price,
        });
      });
    });

    addItem({
      menu_id: menu.id,
      menu_name: menu.name,
      unit_price: menu.price,
      quantity,
      options: cartOptions,
      option_total_price: optionTotalPrice,
    });

    navigate('/', { replace: true });
  }, [menu, selectedOptions, quantity, optionTotalPrice, addItem, navigate]);

  if (isError) {
    return <ErrorFallback onRetry={refetch} />;
  }

  if (isLoading || !menu) {
    return (
      <div className={styles.loading} data-testid="menu-detail-loading">
        메뉴 정보를 불러오는 중...
      </div>
    );
  }

  // 옵션이 없는 메뉴는 useEffect에서 처리되므로 여기서 렌더링 불필요
  if (menu.option_groups.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} data-testid="menu-detail-page">
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          data-testid="menu-detail-back"
        >
          &larr; 뒤로
        </button>
      </div>

      {menu.image_url && (
        <img src={menu.image_url} alt={menu.name} className={styles.image} />
      )}

      <div className={styles.info}>
        <h1 className={styles.name}>{menu.name}</h1>
        {menu.description && (
          <p className={styles.description}>{menu.description}</p>
        )}
        <span className={styles.price}>{formatPrice(menu.price)}</span>
      </div>

      <div className={styles.options}>
        {menu.option_groups.map((group) => (
          <OptionSelector
            key={group.id}
            group={group}
            selectedItems={selectedOptions.get(group.id) || []}
            onChange={(items) => handleOptionChange(group.id, items)}
          />
        ))}
      </div>

      {requiredError && (
        <p className={styles.requiredError} data-testid="menu-detail-required-error">
          필수 옵션을 선택해 주세요
        </p>
      )}

      <div className={styles.footer}>
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
        <button
          className={styles.addButton}
          onClick={handleAddToCart}
          data-testid="menu-detail-add-to-cart"
        >
          {formatPrice(totalPrice)} 장바구니 추가
        </button>
      </div>
    </div>
  );
}
