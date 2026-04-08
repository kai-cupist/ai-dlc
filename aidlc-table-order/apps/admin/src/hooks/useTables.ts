import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi, authApi } from 'shared';
import type { TableSetupRequest, TableHistoryQuery } from 'shared';
import { toast } from 'sonner';

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await tablesApi.getTables();
      return response.data.data;
    },
  });
}

export function useTableSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TableSetupRequest) => authApi.tableSetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('테이블 설정이 완료되었습니다.');
    },
    onError: () => toast.error('테이블 설정에 실패했습니다.'),
  });
}

export function useTableHistory(tableId: string, query?: TableHistoryQuery) {
  return useQuery({
    queryKey: ['table-history', tableId, query],
    queryFn: async () => {
      const response = await tablesApi.getHistory(tableId, query);
      return response.data.data;
    },
    enabled: !!tableId,
  });
}

export function useCompleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) => tablesApi.completeTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('이용 완료 처리되었습니다.');
    },
    onError: () => toast.error('이용 완료 처리에 실패했습니다.'),
  });
}
