import { http, HttpResponse } from 'msw';
import type { Table } from '../../types';

const mockTables: Table[] = [
  { id: 'table-001', store_id: 'store-001', table_number: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'table-002', store_id: 'store-001', table_number: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'table-003', store_id: 'store-001', table_number: 3, created_at: '2026-01-01T00:00:00Z' },
];

export const tablesHandlers = [
  http.get('/api/tables', () => {
    return HttpResponse.json({ data: mockTables });
  }),

  http.post('/api/tables/:tableId/complete', () => {
    return HttpResponse.json({
      data: { message: '이용 완료 처리되었습니다', session_id: 'session-001', completed_at: new Date().toISOString() },
    });
  }),

  http.get('/api/tables/:tableId/history', () => {
    return HttpResponse.json({ data: [] });
  }),
];
