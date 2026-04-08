import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@table-order/shared';

export function useReceipt() {
  return useQuery({
    queryKey: ['receipt'],
    queryFn: () => ordersApi.getReceipt().then((res) => res.data.data),
  });
}
