import { useState } from 'react';
import { TableGrid } from '@/components/dashboard/TableGrid';
import { OrderDetailModal } from '@/components/dashboard/OrderDetailModal';
import { PollingStatusIndicator } from '@/components/dashboard/PollingStatusIndicator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { usePolling } from '@/hooks/usePolling';
import type { PollingTableData } from 'shared';

export default function DashboardPage() {
  const { tables, isLoading, isPollingActive, isPollingFailed, resetPolling } =
    usePolling();
  const [selectedTable, setSelectedTable] = useState<PollingTableData | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleTableClick = (table: PollingTableData) => {
    setSelectedTable(table);
    setModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner className="py-24" message="대시보드 로딩 중..." />;
  }

  return (
    <div data-testid="dashboard-page">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">주문 대시보드</h1>
        <PollingStatusIndicator
          isActive={isPollingActive}
          isFailed={isPollingFailed}
          onRetry={resetPolling}
        />
      </div>

      {isPollingFailed && !tables.length ? (
        <ErrorFallback
          message="주문 데이터를 불러올 수 없습니다."
          onRetry={resetPolling}
        />
      ) : (
        <TableGrid tables={tables} onTableClick={handleTableClick} />
      )}

      <OrderDetailModal
        table={selectedTable}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
