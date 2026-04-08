import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useTableHistory } from '@/hooks/useTables';
import { formatPrice, formatDateTime } from 'shared';
import { ArrowLeft } from 'lucide-react';

export default function TableHistoryPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query = dateFrom || dateTo
    ? { date_from: dateFrom || undefined, date_to: dateTo || undefined }
    : undefined;

  const { data: history, isLoading, error, refetch } = useTableHistory(
    tableId ?? '',
    query,
  );

  if (isLoading) return <LoadingSpinner className="py-24" />;
  if (error) return <ErrorFallback onRetry={() => refetch()} />;

  return (
    <div className="space-y-6" data-testid="table-history-page">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tables/setup')}
          data-testid="history-back-button"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          돌아가기
        </Button>
        <h1 className="text-xl font-bold">과거 주문 내역</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">날짜 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="history-date-from"
              />
            </div>
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="history-date-to"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              data-testid="history-filter-clear"
            >
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {history && history.length > 0 ? (
          history.map((record) => (
            <Card key={record.id} data-testid={`history-record-${record.id}`}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{record.round}회차</Badge>
                    <span className="text-sm text-muted-foreground">
                      {record.order_number}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(record.ordered_at)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  {record.items_snapshot.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm"
                    >
                      <div>
                        <span>{item.menu_name}</span>
                        <span className="ml-1 text-muted-foreground">
                          x{item.quantity}
                        </span>
                        {item.options.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({item.options.map((o) => o.option_item_name).join(', ')})
                          </span>
                        )}
                      </div>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right font-medium text-primary">
                  {formatPrice(record.total_amount)}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            과거 주문 내역이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
