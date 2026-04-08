import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useTables, useTableSetup } from '@/hooks/useTables';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, History } from 'lucide-react';
import { formatDateTime } from 'shared';

export default function TableSetupPage() {
  const { storeId } = useAuthContext();
  const navigate = useNavigate();
  const { data: tables, isLoading, error, refetch } = useTables();
  const setupMutation = useTableSetup();

  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    await setupMutation.mutateAsync({
      store_id: storeId,
      table_number: Number(tableNumber),
      password,
    });
    setTableNumber('');
    setPassword('');
  };

  if (isLoading) return <LoadingSpinner className="py-24" />;
  if (error) return <ErrorFallback onRetry={() => refetch()} />;

  return (
    <div className="space-y-6" data-testid="table-setup-page">
      <h1 className="text-xl font-bold">테이블 설정</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">새 테이블 등록</CardTitle>
          <CardDescription>
            태블릿에 설정할 테이블 번호와 비밀번호를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="table-number">테이블 번호</Label>
              <Input
                id="table-number"
                type="number"
                min={1}
                placeholder="번호"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-28"
                data-testid="table-setup-number-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-password">비밀번호</Label>
              <Input
                id="table-password"
                type="password"
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-48"
                data-testid="table-setup-password-input"
              />
            </div>
            <Button
              type="submit"
              disabled={
                !tableNumber || !password || password.length < 8 || setupMutation.isPending
              }
              data-testid="table-setup-submit-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              {setupMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">등록된 테이블</CardTitle>
        </CardHeader>
        <CardContent>
          {tables && tables.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>테이블 번호</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id} data-testid={`table-row-${table.table_number}`}>
                    <TableCell>
                      <Badge variant="secondary">
                        테이블 {table.table_number}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(table.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/tables/${table.id}/history`)
                        }
                        data-testid={`table-history-button-${table.table_number}`}
                      >
                        <History className="mr-1 h-4 w-4" />
                        과거 내역
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              등록된 테이블이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
