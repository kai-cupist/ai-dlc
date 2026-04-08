import { apiClient } from './client';
import type {
  Menu,
  MenuDetail,
  MenusByCategory,
  Category,
  CreateMenuRequest,
  UpdateMenuRequest,
  ReorderMenusRequest,
  ApiResponse,
} from '../types';

export const menusApi = {
  getMenus: (categoryId?: string) =>
    apiClient.get<ApiResponse<MenusByCategory[]>>('/menus', {
      params: categoryId ? { category_id: categoryId } : undefined,
    }),

  getMenuDetail: (menuId: string) =>
    apiClient.get<ApiResponse<MenuDetail>>(`/menus/${menuId}`),

  createMenu: (data: CreateMenuRequest) =>
    apiClient.post<ApiResponse<Menu>>('/menus', data),

  updateMenu: (menuId: string, data: UpdateMenuRequest) =>
    apiClient.put<ApiResponse<Menu>>(`/menus/${menuId}`, data),

  deleteMenu: (menuId: string) =>
    apiClient.delete(`/menus/${menuId}`),

  reorderMenus: (data: ReorderMenusRequest) =>
    apiClient.put('/menus/order', data),

  getCategories: () =>
    apiClient.get<ApiResponse<Category[]>>('/menus/categories'),
};
