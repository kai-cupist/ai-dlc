import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menusApi } from 'shared';
import type { CreateMenuRequest, UpdateMenuRequest, ReorderMenusRequest } from 'shared';
import { toast } from 'sonner';

export function useMenus(categoryId?: string) {
  return useQuery({
    queryKey: ['menus', categoryId],
    queryFn: async () => {
      const response = await menusApi.getMenus(categoryId);
      return response.data.data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await menusApi.getCategories();
      return response.data.data;
    },
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuRequest) => menusApi.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴가 등록되었습니다.');
    },
    onError: () => toast.error('메뉴 등록에 실패했습니다.'),
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: UpdateMenuRequest }) =>
      menusApi.updateMenu(menuId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴가 수정되었습니다.');
    },
    onError: () => toast.error('메뉴 수정에 실패했습니다.'),
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menuId: string) => menusApi.deleteMenu(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴가 삭제되었습니다.');
    },
    onError: () => toast.error('메뉴 삭제에 실패했습니다.'),
  });
}

export function useReorderMenus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderMenusRequest) => menusApi.reorderMenus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴 순서가 변경되었습니다.');
    },
    onError: () => toast.error('순서 변경에 실패했습니다.'),
  });
}
