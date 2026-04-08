import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optionGroupsApi } from 'shared';
import type { CreateOptionGroupRequest, UpdateOptionGroupRequest } from 'shared';
import { toast } from 'sonner';

export function useOptionGroups() {
  return useQuery({
    queryKey: ['option-groups'],
    queryFn: async () => {
      const response = await optionGroupsApi.getOptionGroups();
      return response.data.data;
    },
  });
}

export function useCreateOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOptionGroupRequest) =>
      optionGroupsApi.createOptionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      toast.success('옵션 그룹이 생성되었습니다.');
    },
    onError: () => toast.error('옵션 그룹 생성에 실패했습니다.'),
  });
}

export function useUpdateOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateOptionGroupRequest;
    }) => optionGroupsApi.updateOptionGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      toast.success('옵션 그룹이 수정되었습니다.');
    },
    onError: () => toast.error('옵션 그룹 수정에 실패했습니다.'),
  });
}

export function useDeleteOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      optionGroupsApi.deleteOptionGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      toast.success('옵션 그룹이 삭제되었습니다.');
    },
    onError: () => toast.error('옵션 그룹 삭제에 실패했습니다.'),
  });
}

export function useLinkOptionToMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, menuId }: { groupId: string; menuId: string }) =>
      optionGroupsApi.linkToMenu(groupId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴에 옵션이 연결되었습니다.');
    },
    onError: () => toast.error('옵션 연결에 실패했습니다.'),
  });
}

export function useUnlinkOptionFromMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, menuId }: { groupId: string; menuId: string }) =>
      optionGroupsApi.unlinkFromMenu(groupId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('메뉴에서 옵션이 해제되었습니다.');
    },
    onError: () => toast.error('옵션 해제에 실패했습니다.'),
  });
}
