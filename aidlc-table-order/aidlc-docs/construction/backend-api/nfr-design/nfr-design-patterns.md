# NFR 설계 패턴 - backend-api

## 1. 보안 패턴

### P-SEC-01: JWT 인증 미들웨어
- FastAPI `Depends`로 모든 인증 필요 엔드포인트에 적용
- 토큰 검증: 서명, 만료, role, store_id
- 역할 분리: `require_admin`, `require_table` 의존성 함수
- 실패 시 401 Unauthorized (상세 정보 미노출)

### P-SEC-02: Rate Limiting
- `slowapi` 미들웨어
- 복합 키 기반 (서비스 계층에서 키 추출)
- 인메모리 저장 (추후 Redis 교체 가능)
- 429 응답 + `Retry-After` 헤더

### P-SEC-03: 입력 검증 계층
```
HTTP Request
    |
    v
Pydantic DTO (타입/형식/길이 검증)
    |
    v
Service Layer (비즈니스 규칙 검증)
    |
    v
Repository (DB 제약조건)
```

### P-SEC-04: CORS 정책
- 허용 origin: 고객앱, 관리자앱 도메인만
- 인증 엔드포인트: credentials=true
- Methods: GET, POST, PUT, PATCH, DELETE
- 와일드카드 origin 금지

### P-SEC-05: 보안 헤더 미들웨어
- `Content-Security-Policy: default-src 'self'`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 2. 성능 패턴

### P-PERF-01: 비동기 I/O
- 모든 DB 쿼리: `async/await` (SQLAlchemy AsyncSession)
- 모든 S3 호출: `aioboto3`
- 모든 외부 통신: `httpx.AsyncClient`
- FastAPI 라우터: `async def` 엔드포인트

### P-PERF-02: 커넥션 풀링
- SQLAlchemy: `pool_size=10, max_overflow=40, pool_timeout=30`
- 커넥션 재사용으로 DB 연결 오버헤드 최소화
- 풀 소진 시 30초 대기 후 타임아웃 에러

### P-PERF-03: 인기 메뉴 캐싱
- 매장별 인기 메뉴 목록: 인메모리 캐시 (TTL 5분)
- 캐시 키: `popular_menus:{store_id}`
- 캐시 미스 시 DB 쿼리 → 캐시 저장
- 메뉴 변경/주문 생성 시 캐시 무효화하지 않음 (TTL 만료 의존)

### P-PERF-04: 폴링 최적화
- `since` 파라미터로 증분 조회 (마지막 조회 이후 변경분만)
- 인덱스: `orders(store_id, updated_at)`, `orders(store_id, session_id, status)`
- 응답 크기 최소화: 필요한 필드만 반환

---

## 3. 신뢰성 패턴

### P-RELY-01: 트랜잭션 관리
```python
async with session.begin():
    # 모든 DB 작업이 단일 트랜잭션
    # 예외 발생 시 자동 롤백
```
- 주문 생성: Order + OrderItem + OrderItemOption 원자적 저장
- 이용 완료: 아카이빙 + 삭제 + 세션 완료 원자적 처리
- 주문 삭제: 삭제 + 총액 재계산 원자적 처리

### P-RELY-02: 글로벌 에러 핸들러
```
Exception 발생
    |
    v
글로벌 에러 핸들러
    |
    +-- ValidationError → 422 (필드별 에러 상세)
    +-- AuthenticationError → 401 (상세 미노출)
    +-- AuthorizationError → 403 (상세 미노출)
    +-- NotFoundError → 404
    +-- BusinessRuleError → 400 (비즈니스 에러 메시지)
    +-- RateLimitError → 429 + Retry-After
    +-- 예상치 못한 에러 → 500 (제네릭 메시지, 스택트레이스 로깅만)
```

### P-RELY-03: 헬스 체크
- `GET /health`: DB 연결 확인 포함
- 정상: 200 `{"status": "healthy", "db": "connected"}`
- 비정상: 503 `{"status": "unhealthy", "db": "disconnected"}`

---

## 4. 관측성 패턴

### P-OBS-01: 구조화된 로깅
```json
{
  "timestamp": "2026-04-08T12:00:00Z",
  "level": "INFO",
  "message": "Order created",
  "request_id": "uuid",
  "store_id": "uuid",
  "table_id": "uuid",
  "order_id": "uuid",
  "round": 1,
  "total_amount": 25000
}
```
- 모든 요청에 `request_id` 자동 생성 (미들웨어)
- 인증된 요청에 `store_id`, `user_id`/`table_id` 자동 바인딩
- 비밀번호, 토큰, PII는 로깅하지 않음

### P-OBS-02: 요청 로깅 미들웨어
- 모든 요청: method, path, status_code, duration_ms
- 느린 요청 (>500ms): WARNING 레벨로 기록
- 에러 요청: ERROR 레벨 + 에러 상세
