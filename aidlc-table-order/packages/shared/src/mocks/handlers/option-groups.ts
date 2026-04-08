import { http, HttpResponse } from 'msw';
import { mockOptionGroups } from '../data/seed';

export const optionGroupsHandlers = [
  http.get('/api/option-groups', () => {
    return HttpResponse.json({ data: mockOptionGroups });
  }),

  http.post('/api/option-groups', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newGroup = { id: `og-new-${Date.now()}`, store_id: 'store-001', ...body, created_at: new Date().toISOString() };
    return HttpResponse.json({ data: newGroup }, { status: 201 });
  }),

  http.put('/api/option-groups/:groupId', async ({ params, request }) => {
    const group = mockOptionGroups.find((g) => g.id === params.groupId);
    if (!group) return HttpResponse.json({ detail: '옵션 그룹을 찾을 수 없습니다' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ data: { ...group, ...body } });
  }),

  http.delete('/api/option-groups/:groupId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/option-groups/:groupId/menus/:menuId', () => {
    return HttpResponse.json({ data: { message: '연결되었습니다' } }, { status: 201 });
  }),

  http.delete('/api/option-groups/:groupId/menus/:menuId', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
