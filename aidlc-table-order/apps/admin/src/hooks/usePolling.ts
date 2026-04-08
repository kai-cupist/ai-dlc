import { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from 'shared';
import type { PollingResponse } from 'shared';

const POLLING_INTERVAL = 2000;

export function usePolling() {
  const lastTimestamp = useRef<string | undefined>(undefined);

  const query = useQuery<PollingResponse>({
    queryKey: ['polling'],
    queryFn: async () => {
      const response = await ordersApi.getPollingData(lastTimestamp.current);
      const data = response.data.data;
      lastTimestamp.current = data.timestamp;
      return data;
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });

  const isPollingActive = !query.isError && query.isFetching;
  const isPollingFailed = query.isError;

  const resetPolling = useCallback(() => {
    lastTimestamp.current = undefined;
    query.refetch();
  }, [query]);

  return {
    tables: query.data?.tables ?? [],
    isLoading: query.isLoading,
    isPollingActive,
    isPollingFailed,
    error: query.error,
    resetPolling,
  };
}
