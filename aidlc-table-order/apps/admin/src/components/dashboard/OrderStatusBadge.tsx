import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from 'shared';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: '대기중',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  preparing: {
    label: '준비중',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  completed: {
    label: '완료',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      data-testid={`order-status-badge-${status}`}
    >
      {config.label}
    </Badge>
  );
}
