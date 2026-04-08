# shared 패키지 코드 요약

## 생성 파일 목록 (41개)

### 프로젝트 설정 (3개)
- `package.json` - 모노레포 루트 (npm workspaces)
- `packages/shared/package.json` - shared 패키지 (axios, msw, typescript)
- `packages/shared/tsconfig.json` - TypeScript 설정

### OpenAPI 스펙 (1개)
- `packages/shared/openapi.json` - OpenAPI 3.0 스펙 (28개 엔드포인트, 21개 스키마)

### TypeScript 타입 (8개)
- `types/common.ts` - ApiResponse, ErrorResponse, OrderStatus, SessionStatus, UserRole
- `types/store.ts` - Store
- `types/auth.ts` - AdminLoginRequest, TableSetupRequest, AuthResponse, TokenPayload
- `types/table.ts` - Table, TableSession, TableCompleteResponse
- `types/menu.ts` - Menu, MenuDetail, Category, OptionGroup, OptionItem, CRUD 요청 타입
- `types/order.ts` - Order, OrderItem, OrderWithItems, PollingResponse, ReceiptResponse, OrderProgress
- `types/recommendation.ts` - RecommendationRequest, RecommendedMenu
- `types/index.ts` - re-export

### API 클라이언트 (9개)
- `api/client.ts` - Axios 인스턴스 (토큰 자동 첨부, 401 자동 갱신)
- `api/auth.ts` - 인증 4개 엔드포인트
- `api/stores.ts` - 매장 1개 엔드포인트
- `api/tables.ts` - 테이블 3개 엔드포인트
- `api/menus.ts` - 메뉴 7개 엔드포인트
- `api/option-groups.ts` - 옵션 그룹 6개 엔드포인트
- `api/orders.ts` - 주문 7개 엔드포인트
- `api/recommendations.ts` - 추천 1개 엔드포인트
- `api/index.ts` - re-export

### MSW Mock 핸들러 (11개)
- `mocks/browser.ts` - MSW 워커 설정
- `mocks/data/seed.ts` - 시드 데이터 (매장, 카테고리, 메뉴 6개, 옵션 그룹 2개)
- `mocks/handlers/auth.ts` - 인증 mock (로그인 성공/실패)
- `mocks/handlers/stores.ts` - 매장 mock
- `mocks/handlers/tables.ts` - 테이블 mock (3개 테이블)
- `mocks/handlers/menus.ts` - 메뉴 mock (카테고리별, 옵션, CRUD)
- `mocks/handlers/option-groups.ts` - 옵션 그룹 mock
- `mocks/handlers/orders.ts` - 주문 mock (생성, 상태변경, 폴링, 영수증, 진행률)
- `mocks/handlers/recommendations.ts` - 추천 mock (장바구니 제외 메뉴)
- `mocks/handlers/index.ts` - 전체 핸들러 합치기
- `mocks/index.ts` - export

### 공통 훅 (2개)
- `hooks/useAuth.ts` - JWT 파싱, 인증 상태, 역할 확인, 로그인/로그아웃
- `hooks/index.ts` - re-export

### 유틸리티 (4개)
- `utils/format.ts` - formatPrice, formatDateTime, formatTime, formatRemainingTime
- `utils/validation.ts` - isValidPassword, isNotEmpty, isPositiveNumber, isValidQuantity
- `utils/storage.ts` - CartItem 타입, loadCart, saveCart, clearCart
- `utils/index.ts` - re-export

### 진입점 (1개)
- `src/index.ts` - 전체 모듈 re-export

## API 엔드포인트 커버리지

| 그룹 | 엔드포인트 수 | 타입 | API 클라이언트 | MSW Mock |
|------|-------------|------|---------------|----------|
| Auth | 4 | ✅ | ✅ | ✅ |
| Store | 1 | ✅ | ✅ | ✅ |
| Table | 3 | ✅ | ✅ | ✅ |
| Menu | 7 | ✅ | ✅ | ✅ |
| OptionGroup | 6 | ✅ | ✅ | ✅ |
| Order | 7 | ✅ | ✅ | ✅ |
| Recommendation | 1 | ✅ | ✅ | ✅ |
| **합계** | **29** | **29/29** | **29/29** | **29/29** |
