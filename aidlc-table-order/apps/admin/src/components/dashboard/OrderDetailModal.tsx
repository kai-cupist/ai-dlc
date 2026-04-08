import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ordersApi, tablesApi, formatPrice } from 'shared';
import type { PollingTableData, OrderStatus } from 'shared';
import { toast } from 'sonner';
import { Trash2, CheckCircle } from 'lucide-react';

interface OrderDetailModalProps {
  table: PollingTableData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'completed',
};

const statusActionLabel: Partial<Record<OrderStatus, string>> = {
  pending: '준비 시작',
  preparing: '완료 처리',
};

export function OrderDetailModal({
  table,
  open,
  onOpenChange,
}: OrderDetailModalProps) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ['session-orders', table?.table_id, table?.session_id],
    queryFn: () => ordersApi.getSessionOrders(),
    enabled: open && !!table?.session_id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling'] });
      queryClient.invalidateQueries({ queryKey: ['session-orders'] });
      toast.success('주문 상태가 변경되었습니다.');
    },
    onError: () => toast.error('상태 변경에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling'] });
      queryClient.invalidateQueries({ queryKey: ['session-orders'] });
      setDeleteTarget(null);
      toast.success('주문이 삭제되었습니다.');
    },
    onError: () => toast.error('주문 삭제에 실패했습니다.'),
  });

  const completeMutation = useMutation({
    mutationFn: (tableId: string) => tablesApi.completeTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polling'] });
      setShowComplete(false);
      onOpenChange(false);
      toast.success('이용 완료 처리되었습니다.');
    },
    onError: () => toast.error('이용 완료 처리에 실패했습니다.'),
  });

  if (!table) return null;

  const orders = ordersQuery.data?.data?.data?.orders ?? [];
  const totalAmount = ordersQuery.data?.data?.data?.total_amount ?? table.total_amount;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[80vh] overflow-y-auto sm:max-w-lg"
          data-testid="order-detail-modal"
        >
          <DialogHeader>
            <DialogTitle>테이블 {table.table_number} - 주문 상세</DialogTitle>
          </DialogHeader>

          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              주문 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border p-4"
                  data-testid={`order-item-${order.order_number}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{order.round}회차</Badge>
                      <span className="text-xs text-muted-foreground">
                        {order.order_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      {nextStatus[order.status] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            statusMutation.mutate({
                              orderId: order.id,
                              status: nextStatus[order.status]!,
                            })
                          }
                          disabled={statusMutation.isPending}
                          data-testid={`order-status-change-${order.order_number}`}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {statusActionLabel[order.status]}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between text-sm"
                      >
                        <div>
                          <span>{item.menu_name}</span>
                          <span className="ml-1 text-muted-foreground">
                            x{item.quantity}
                          </span>
                          {item.options.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.options
                                .map((o) => `${o.option_group_name}: ${o.option_item_name}`)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="whitespace-nowrap">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-sm font-medium">
                      {formatPrice(order.total_amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(order.id)}
                      data-testid={`order-delete-${order.order_number}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">총 주문액</span>
              <p className="text-xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </p>
            </div>
            {table.session_id && (
              <Button
                variant="destructive"
                onClick={() => setShowComplete(true)}
                data-testid="table-complete-button"
              >
                이용 완료
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="주문 삭제"
        description="이 주문을 삭제하시겠습니까? 삭제 후 복구할 수 없으며, 총 주문액이 재계산됩니다."
        confirmLabel="삭제"
        confirmVariant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={showComplete}
        onOpenChange={setShowComplete}
        title="이용 완료"
        description="테이블 이용을 완료 처리하시겠습니까? 현재 주문 내역이 과거 이력으로 이동되고, 테이블이 초기화됩니다."
        confirmLabel="이용 완료"
        confirmVariant="destructive"
        onConfirm={() => table && completeMutation.mutate(table.table_id)}
        isLoading={completeMutation.isPending}
      />
    </>
  );
}
