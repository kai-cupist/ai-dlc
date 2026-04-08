import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';
import { formatPrice } from 'shared';
import type { PollingTableData } from 'shared';

interface TableCardProps {
  table: PollingTableData;
  onClick: (table: PollingTableData) => void;
}

export function TableCard({ table, onClick }: TableCardProps) {
  const hasActiveSession = table.session_id !== null;
  const hasOrders = table.recent_orders.length > 0;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
        table.has_new && 'ring-2 ring-primary animate-pulse',
        !hasActiveSession && 'opacity-60',
      )}
      onClick={() => onClick(table)}
      data-testid={`table-card-${table.table_number}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            테이블 {table.table_number}
          </CardTitle>
          {table.has_new && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasActiveSession && hasOrders ? (
          <>
            <p className="mb-2 text-lg font-bold text-primary">
              {formatPrice(table.total_amount)}
            </p>
            <div className="space-y-1">
              {table.recent_orders.slice(0, 3).map((order) => (
                <div
                  key={order.order_id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate text-muted-foreground">
                    {order.summary}
                  </span>
                  <OrderStatusBadge status={order.status} className="ml-2 text-[10px]" />
                </div>
              ))}
              {table.recent_orders.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{table.recent_orders.length - 3}건 더
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">빈 테이블</p>
        )}
      </CardContent>
    </Card>
  );
}
