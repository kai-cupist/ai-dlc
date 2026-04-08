import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCard } from './TableCard';
import type { PollingTableData } from 'shared';

interface TableGridProps {
  tables: PollingTableData[];
  onTableClick: (table: PollingTableData) => void;
}

export function TableGrid({ tables, onTableClick }: TableGridProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredTables = useMemo(() => {
    if (filter === 'all') return tables;
    if (filter === 'active') return tables.filter((t) => t.session_id !== null);
    if (filter === 'empty') return tables.filter((t) => t.session_id === null);
    if (filter === 'new') return tables.filter((t) => t.has_new);
    return tables;
  }, [tables, filter]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          테이블 현황{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredTables.length}개)
          </span>
        </h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger
            className="w-36"
            data-testid="table-filter-select"
          >
            <SelectValue placeholder="필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">이용중</SelectItem>
            <SelectItem value="empty">빈 테이블</SelectItem>
            <SelectItem value="new">신규 주문</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        data-testid="table-grid"
      >
        {filteredTables.map((table) => (
          <TableCard
            key={table.table_id}
            table={table}
            onClick={onTableClick}
          />
        ))}
      </div>
      {filteredTables.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          표시할 테이블이 없습니다.
        </p>
      )}
    </div>
  );
}
