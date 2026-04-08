# 논리적 컴포넌트 - backend-api

## 컴포넌트 다이어그램

```
+---------------------------------------------------------------+
|                    FastAPI Application                        |
|                                                               |
|  +------------------+  +------------------+  +--------------+ |
|  |   Middleware      |  |   Routers        |  |  Background  | |
|  |  - CORS          |  |  - /auth         |  |  - 캐시 TTL  | |
|  |  - SecurityHeaders|  |  - /stores       |  |              | |
|  |  - RequestLogger  |  |  - /tables       |  +--------------+ |
|  |  - RateLimiter   |  |  - /menus        |                   |
|  |  - ErrorHandler  |  |  - /option-groups |                   |
|  +------------------+  |  - /orders        |                   |
|                        |  - /recommendations|                  |
|                        |  - /health        |                   |
|                        +------------------+                    |
|                               |                                |
|  +----------------------------v-----------------------------+  |
|  |                    Service Layer                         |  |
|  |  AuthService | StoreService | TableService               |  |
|  |  MenuService | OrderService | RecommendationService      |  |
|  +----------------------------+-----------------------------+  |
|                               |                                |
|  +----------------------------v-----------------------------+  |
|  |                  Repository Layer                        |  |
|  |  AdminRepo | StoreRepo | TableRepo | TableSessionRepo    |  |
|  |  MenuRepo | CategoryRepo | OptionGroupRepo               |  |
|  |  OrderRepo | OrderHistoryRepo                             |  |
|  +----------------------------+-----------------------------+  |
|                               |                                |
+-------------------------------|--------------------------------+
                                |
          +---------------------+---------------------+
          |                                           |
+---------v---------+                     +-----------v---------+
|    PostgreSQL     |                     |      AWS S3         |
|  - stores         |                     |  - menu-images/     |
|  - admins         |                     +---------------------+
|  - tables         |
|  - table_sessions |
|  - categories     |
|  - menus          |
|  - option_groups  |
|  - option_items   |
|  - menu_option_groups |
|  - orders         |
|  - order_items    |
|  - order_item_options |
|  - order_history  |
+-------------------+
```

## 미들웨어 스택 (실행 순서)

| 순서 | 미들웨어 | 패턴 | 설명 |
|------|---------|------|------|
| 1 | CORSMiddleware | P-SEC-04 | CORS 정책 적용 |
| 2 | SecurityHeadersMiddleware | P-SEC-05 | 보안 헤더 주입 |
| 3 | RequestLoggerMiddleware | P-OBS-02 | 요청 로깅, request_id 생성 |
| 4 | RateLimitMiddleware | P-SEC-02 | Rate Limiting |
| 5 | GlobalErrorHandler | P-RELY-02 | 예외 → HTTP 응답 변환 |

## 의존성 주입 (FastAPI Depends)

| 의존성 | 용도 | 사용 위치 |
|--------|------|-----------|
| `get_db_session` | AsyncSession 주입 | 모든 라우터 |
| `get_current_user` | JWT 검증 → 사용자 정보 | 인증 필요 라우터 |
| `require_admin` | 관리자 역할 확인 | 관리자 전용 라우터 |
| `require_table` | 테이블 역할 확인 | 고객 전용 라우터 |

## DB 인덱스 전략

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| admins | (store_id, username) UNIQUE | 로그인 조회 |
| tables | (store_id, table_number) UNIQUE | 테이블 조회 |
| table_sessions | (table_id, status) | 활성 세션 조회 |
| menus | (store_id, category_id, sort_order) | 카테고리별 메뉴 정렬 |
| menus | (store_id, is_popular) | 인기 메뉴 필터 |
| orders | (session_id, round) | 세션 내 주문 조회 |
| orders | (store_id, updated_at) | 폴링 증분 조회 |
| orders | (store_id, created_at) | 주문 번호 생성 (당일 순번) |
| order_history | (table_id, archived_at) | 과거 내역 조회 |
| order_history | (store_id, archived_at) | 추천 로직 히스토리 검색 |
| menu_option_groups | (menu_id, option_group_id) UNIQUE | 중복 연결 방지 |

## 설정 관리

| 설정 | 소스 | 기본값 |
|------|------|--------|
| DATABASE_URL | 환경변수 | - (필수) |
| SECRET_KEY | 환경변수 | - (필수) |
| JWT_EXPIRY_HOURS | 환경변수 | 16 |
| AWS_S3_BUCKET | 환경변수 | - (필수) |
| AWS_REGION | 환경변수 | ap-northeast-2 |
| DB_POOL_SIZE | 환경변수 | 10 |
| DB_MAX_OVERFLOW | 환경변수 | 40 |
| CORS_ORIGINS | 환경변수 | [] (필수) |
| LOG_LEVEL | 환경변수 | INFO |
| POPULAR_MENU_CACHE_TTL | 환경변수 | 300 (5분) |
| POPULAR_MENU_TOP_PERCENT | 환경변수 | 20 |
| POPULAR_MENU_DAYS | 환경변수 | 30 |
| LOGIN_MAX_ATTEMPTS | 환경변수 | 5 |
| LOGIN_LOCKOUT_MINUTES | 환경변수 | 15 |

> 모든 설정은 Pydantic `BaseSettings`로 관리, `.env` 파일 또는 환경변수에서 로드
