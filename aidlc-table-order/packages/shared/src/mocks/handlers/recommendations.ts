import { http, HttpResponse } from 'msw';
import { mockMenus } from '../data/seed';

export const recommendationsHandlers = [
  http.post('/api/recommendations', async ({ request }) => {
    const body = await request.json() as { menu_ids: string[] };
    const recommended = mockMenus
      .filter((m) => !body.menu_ids.includes(m.id) && m.is_available)
      .slice(0, 5)
      .map((m) => ({ id: m.id, name: m.name, price: m.price, image_url: m.image_url }));
    return HttpResponse.json({ data: { recommendations: recommended } });
  }),
];
