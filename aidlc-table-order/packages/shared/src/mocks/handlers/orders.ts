import { http, HttpResponse } from 'msw';
import { createMockOrder } from '../data/seed';
import type { OrderWithItems, PollingResponse } from '../../types';

const mockOrders: OrderWithItems[] = [];
let roundCounter = 0;

export const ordersHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as { items: Array<{ menu_id: string; quantity: number }> };
    roundCounter++;
    const order = createMockOrder(roundCounter);
    const orderWithItems: OrderWithItems = {
      ...order,
      items: body.items.map((item, i) => ({
        id: `oi-${Date.now()}-${i}`,
        order_id: order.id,
        menu_id: item.menu_id,
        menu_name: `메뉴 ${i + 1}`,
        quantity: item.quantity,
        unit_price: 9000,
        option_total_price: 0,
        subtotal: 9000 * item.quantity,
        options: [],
      })),
    };
    mockOrders.push(orderWithItems);
    return HttpResponse.json({ data: orderWithItems }, { status: 201 });
  }),

  http.get('/api/orders', () => {
    const totalAmount = mockOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return HttpResponse.json({ data: { orders: mockOrders, total_amount: totalAmount } });
  }),

  http.patch('/api/orders/:orderId/status', async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const order = mockOrders.find((o) => o.id === params.orderId);
    if (!order) return HttpResponse.json({ detail: '주문을 찾을 수 없습니다' }, { status: 404 });
    order.status = body.status as OrderWithItems['status'];
    order.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: order });
  }),

  http.delete('/api/orders/:orderId', ({ params }) => {
    const idx = mockOrders.findIndex((o) => o.id === params.orderId);
    if (idx === -1) return HttpResponse.json({ detail: '주문을 찾을 수 없습니다' }, { status: 404 });
    mockOrders.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/orders/polling', () => {
    const response: PollingResponse = {
      tables: [{
        table_id: 'table-001',
        table_number: 1,
        session_id: 'session-001',
        total_amount: mockOrders.reduce((sum, o) => sum + o.total_amount, 0),
        recent_orders: mockOrders.slice(-3).map((o) => ({
          order_id: o.id,
          order_number: o.order_number,
          round: o.round,
          status: o.status,
          summary: `${o.items.length}개 메뉴`,
          total_amount: o.total_amount,
          created_at: o.created_at,
        })),
        has_new: false,
      }],
      timestamp: new Date().toISOString(),
    };
    return HttpResponse.json({ data: response });
  }),

  http.get('/api/orders/receipt', () => {
    return HttpResponse.json({
      data: {
        session_id: 'session-001',
        table_number: 1,
        rounds: mockOrders.map((o) => ({
          round: o.round,
          order_number: o.order_number,
          ordered_at: o.created_at,
          items: o.items,
          round_total: o.total_amount,
        })),
        total_amount: mockOrders.reduce((sum, o) => sum + o.total_amount, 0),
      },
    });
  }),

  http.get('/api/orders/:orderId/progress', () => {
    return HttpResponse.json({
      data: {
        order_id: 'order-001',
        status: 'preparing',
        estimated_total_seconds: 900,
        elapsed_seconds: 300,
        progress_percent: 33,
      },
    });
  }),
];
