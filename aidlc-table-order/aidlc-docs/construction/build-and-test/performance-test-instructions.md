# 성능 테스트 지침

## 성능 요구사항

| 항목 | 목표 |
|------|------|
| API 응답 시간 (일반) | 95th percentile < 200ms |
| API 응답 시간 (폴링) | 95th percentile < 100ms |
| 동시 접속 | 매장당 50+ 테이블 |
| 폴링 간격 | 2초 |

## 도구
- **k6** (권장) - 경량 부하 테스트 도구

## 설치
```bash
# macOS
brew install k6

# Linux
sudo apt install k6
```

## 테스트 시나리오

### PERF-01: 폴링 엔드포인트 부하 테스트
```javascript
// k6-polling.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // 50 테이블 동시 폴링
    { duration: '1m', target: 50 },   // 1분 유지
    { duration: '10s', target: 0 },   // 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],  // 95th < 100ms
  },
};

export default function () {
  const res = http.get('http://localhost:8000/api/orders/polling', {
    headers: { Authorization: 'Bearer <token>' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(2);  // 2초 폴링 간격
}
```

### PERF-02: 주문 생성 동시 부하
```javascript
// k6-orders.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,           // 20개 테이블 동시 주문
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
  },
};

export default function () {
  const payload = JSON.stringify({
    items: [{ menu_id: 'menu-001', quantity: 1, options: [] }],
  });
  const res = http.post('http://localhost:8000/api/orders', payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer <token>',
    },
  });
  check(res, { 'status 201': (r) => r.status === 201 });
}
```

## 실행
```bash
k6 run k6-polling.js
k6 run k6-orders.js
```

## 결과 분석
- `http_req_duration` p95 < 목표치 확인
- `http_req_failed` 비율 < 1% 확인
- DB 커넥션 풀 소진 여부 확인 (backend 로그)
