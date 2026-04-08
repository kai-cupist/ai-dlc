import { http, HttpResponse } from 'msw';

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token';
const MOCK_REFRESH = 'mock-refresh-token';

export const authHandlers = [
  http.post('/api/auth/admin/login', async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    if (body.username === 'admin' && body.password === 'password123') {
      return HttpResponse.json({
        data: { access_token: MOCK_TOKEN, refresh_token: MOCK_REFRESH, token_type: 'bearer', expires_in: 57600 },
      });
    }
    return HttpResponse.json({ detail: '인증 실패' }, { status: 401 });
  }),

  http.post('/api/auth/table/setup', async () => {
    return HttpResponse.json({
      data: { access_token: MOCK_TOKEN, refresh_token: MOCK_REFRESH, token_type: 'bearer', expires_in: 57600 },
    });
  }),

  http.post('/api/auth/table/auto-login', async () => {
    return HttpResponse.json({
      data: { access_token: MOCK_TOKEN, refresh_token: MOCK_REFRESH, token_type: 'bearer', expires_in: 57600 },
    });
  }),

  http.post('/api/auth/token/refresh', async () => {
    return HttpResponse.json({
      data: { access_token: MOCK_TOKEN, refresh_token: MOCK_REFRESH, token_type: 'bearer', expires_in: 57600 },
    });
  }),
];
