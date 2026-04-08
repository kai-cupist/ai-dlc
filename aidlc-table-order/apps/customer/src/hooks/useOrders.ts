import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderRequest } from '@table-order/shared';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      ordersApi.createOrder(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionOrders'] });
      queryClient.invalidateQueries({ queryKey: ['receipt'] });
    },
  });
}

export function useSessionOrders() {
  return useQuery({
    queryKey: ['sessionOrders'],
    queryFn: () => ordersApi.getSessionOrders().then((res) => res.data.data),
  });
}

export function useOrderProgress(orderId: string | null) {
  return useQuery({
    queryKey: ['orderProgress', orderId],
    queryFn: () =>
      ordersApi.getOrderProgress(orderId!).then((res) => res.data.data),
    enabled: !!orderId,
    refetchInterval: 2000,
  });
}
