import { apiClient } from './client';
import type {
  OptionGroupWithItems,
  CreateOptionGroupRequest,
  UpdateOptionGroupRequest,
  ApiResponse,
} from '../types';

export const optionGroupsApi = {
  getOptionGroups: () =>
    apiClient.get<ApiResponse<OptionGroupWithItems[]>>('/option-groups'),

  createOptionGroup: (data: CreateOptionGroupRequest) =>
    apiClient.post<ApiResponse<OptionGroupWithItems>>('/option-groups', data),

  updateOptionGroup: (groupId: string, data: UpdateOptionGroupRequest) =>
    apiClient.put<ApiResponse<OptionGroupWithItems>>(`/option-groups/${groupId}`, data),

  deleteOptionGroup: (groupId: string) =>
    apiClient.delete(`/option-groups/${groupId}`),

  linkToMenu: (groupId: string, menuId: string) =>
    apiClient.post(`/option-groups/${groupId}/menus/${menuId}`),

  unlinkFromMenu: (groupId: string, menuId: string) =>
    apiClient.delete(`/option-groups/${groupId}/menus/${menuId}`),
};
