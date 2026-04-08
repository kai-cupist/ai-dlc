import { http, HttpResponse } from 'msw';
import { mockMenus, mockCategories, mockOptionGroups } from '../data/seed';
import type { MenusByCategory } from '../../types';

export const menusHandlers = [
  http.get('/api/menus', () => {
    const grouped: MenusByCategory[] = mockCategories.map((category) => ({
      category,
      menus: mockMenus
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => {
          if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1;
          return a.sort_order - b.sort_order;
        }),
    }));
    return HttpResponse.json({ data: grouped });
  }),

  http.get('/api/menus/categories', () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  http.get('/api/menus/:menuId', ({ params }) => {
    const menu = mockMenus.find((m) => m.id === params.menuId);
    if (!menu) return HttpResponse.json({ detail: '메뉴를 찾을 수 없습니다' }, { status: 404 });
    return HttpResponse.json({
      data: { ...menu, option_groups: mockOptionGroups },
    });
  }),

  http.post('/api/menus', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newMenu = { id: `menu-new-${Date.now()}`, store_id: 'store-001', ...body, sort_order: 99, is_popular: false, is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    return HttpResponse.json({ data: newMenu }, { status: 201 });
  }),

  http.put('/api/menus/:menuId', async ({ params, request }) => {
    const menu = mockMenus.find((m) => m.id === params.menuId);
    if (!menu) return HttpResponse.json({ detail: '메뉴를 찾을 수 없습니다' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ data: { ...menu, ...body, updated_at: new Date().toISOString() } });
  }),

  http.delete('/api/menus/:menuId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.put('/api/menus/order', () => {
    return HttpResponse.json({ data: { message: '순서가 변경되었습니다' } });
  }),
];
