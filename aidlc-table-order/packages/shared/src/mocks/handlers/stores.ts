import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/seed';

export const storesHandlers = [
  http.get('/api/stores/:storeId', () => {
    return HttpResponse.json({ data: mockStore });
  }),
];
