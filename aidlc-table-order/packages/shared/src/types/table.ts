import type { SessionStatus } from './common';

export interface Table {
  id: string;
  store_id: string;
  table_number: number;
  created_at: string;
}

export interface TableSession {
  id: string;
  table_id: string;
  store_id: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
}

export interface TableCompleteResponse {
  message: string;
  session_id: string;
  completed_at: string;
}

export interface TableHistoryQuery {
  date_from?: string;
  date_to?: string;
}
