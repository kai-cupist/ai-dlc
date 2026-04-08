import { useQuery } from '@tanstack/react-query';
import { menusApi } from '@table-order/shared';

export function useMenusByCategory() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => menusApi.getMenus().then((res) => res.data.data),
  });
}

export function useMenuDetail(menuId: string) {
  return useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => menusApi.getMenuDetail(menuId).then((res) => res.data.data),
    enabled: !!menuId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menusApi.getCategories().then((res) => res.data.data),
  });
}
