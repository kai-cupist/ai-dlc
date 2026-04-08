import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '@table-order/shared';

export function useRecommendations(menuIds: string[]) {
  return useQuery({
    queryKey: ['recommendations', menuIds],
    queryFn: () =>
      recommendationsApi
        .getRecommendations({ menu_ids: menuIds })
        .then((res) => res.data.data),
    enabled: menuIds.length > 0,
  });
}
