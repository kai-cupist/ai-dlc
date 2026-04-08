# shared Code Generation 계획

> **유닛**: shared (API 계약 + 공유 코드)
> **Phase**: Phase 1 (최우선 - 병렬 개발 기반)
> **목적**: OpenAPI 스펙, TypeScript 타입, API 클라이언트, MSW mock, 공통 훅/유틸 생성

---

## 유닛 컨텍스트

### 담당 역할
- 28개 API 엔드포인트의 계약 정의 (OpenAPI 3.0)
- TypeScript 타입 (요청/응답/엔티티)
- Axios 기반 API 클라이언트
- MSW mock 핸들러 (프론트엔드 독립 개발용)
- 공통 훅 (useAuth)
- 유틸리티 (가격 포맷, 날짜 포맷)

### 의존성
- 선행: 없음 (첫 번째 유닛)
- 후행: backend-api, customer-web, admin-web (모두 이 유닛에 의존)

### 참조 설계 문서
- `aidlc-docs/inception/application-design/component-methods.md` (API 엔드포인트 28개)
- `aidlc-docs/construction/backend-api/functional-design/domain-entities.md` (엔티티 13개)
- `aidlc-docs/construction/backend-api/functional-design/business-rules.md` (검증 규칙)

---

## 생성 계획

### Step 1: 프로젝트 구조 설정
- [x] 모노레포 루트 `package.json` 생성 (npm workspaces)
- [x] `packages/shared/package.json` 생성
- [x] `packages/shared/tsconfig.json` 생성
- [x] `packages/shared/src/index.ts` 진입점 생성

### Step 2: TypeScript 타입 정의
- [x] `src/types/store.ts` - Store 관련 타입
- [x] `src/types/auth.ts` - 인증 요청/응답 타입 (로그인, 토큰)
- [x] `src/types/table.ts` - Table, TableSession 타입
- [x] `src/types/menu.ts` - Menu, Category, OptionGroup, OptionItem 타입
- [x] `src/types/order.ts` - Order, OrderItem, OrderItemOption, OrderHistory 타입
- [x] `src/types/recommendation.ts` - 추천 요청/응답 타입
- [x] `src/types/common.ts` - 공통 타입 (ApiResponse, PaginatedResponse, ErrorResponse)
- [x] `src/types/index.ts` - 전체 re-export

### Step 3: API 클라이언트
- [x] `src/api/client.ts` - Axios 인스턴스 (baseURL, 인터셉터, 토큰 자동 첨부)
- [x] `src/api/auth.ts` - 인증 API (로그인, 토큰 갱신, 테이블 설정)
- [x] `src/api/stores.ts` - 매장 API
- [x] `src/api/tables.ts` - 테이블 API (목록, 이용완료, 과거내역)
- [x] `src/api/menus.ts` - 메뉴 API (조회, CRUD, 순서변경)
- [x] `src/api/option-groups.ts` - 옵션 그룹 API (CRUD, 메뉴 연결)
- [x] `src/api/orders.ts` - 주문 API (생성, 조회, 상태변경, 삭제, 폴링, 영수증)
- [x] `src/api/recommendations.ts` - 추천 API
- [x] `src/api/index.ts` - 전체 re-export

### Step 4: MSW Mock 핸들러
- [x] `src/mocks/browser.ts` - MSW 브라우저 워커 설정
- [x] `src/mocks/data/seed.ts` - Mock 시드 데이터 (매장, 메뉴, 주문 샘플)
- [x] `src/mocks/handlers/auth.ts` - 인증 mock (로그인 성공/실패, 토큰)
- [x] `src/mocks/handlers/stores.ts` - 매장 mock
- [x] `src/mocks/handlers/tables.ts` - 테이블 mock
- [x] `src/mocks/handlers/menus.ts` - 메뉴 mock (카테고리별, 옵션 포함)
- [x] `src/mocks/handlers/option-groups.ts` - 옵션 그룹 mock
- [x] `src/mocks/handlers/orders.ts` - 주문 mock (생성, 상태변경, 폴링)
- [x] `src/mocks/handlers/recommendations.ts` - 추천 mock
- [x] `src/mocks/handlers/index.ts` - 전체 핸들러 합치기
- [x] `src/mocks/index.ts` - MSW 초기화 export

### Step 5: 공통 훅
- [x] `src/hooks/useAuth.ts` - JWT 관리, 로그인/로그아웃, 토큰 갱신, 역할 확인
- [x] `src/hooks/index.ts` - re-export

### Step 6: 유틸리티
- [x] `src/utils/format.ts` - 가격 포맷 (원), 날짜/시간 포맷
- [x] `src/utils/validation.ts` - 공통 검증 (비밀번호 길이, 수량 등)
- [x] `src/utils/storage.ts` - localStorage 래퍼 (장바구니 영속화용)
- [x] `src/utils/index.ts` - re-export

### Step 7: OpenAPI 스펙
- [x] `openapi.json` - OpenAPI 3.0 스펙 (28개 엔드포인트, 21개 스키마)

### Step 8: 문서화
- [x] `aidlc-docs/construction/shared/code/code-summary.md` - 생성된 코드 요약

---

## 파일 목록 (예상 ~35개)

```
packages/shared/
+-- package.json
+-- tsconfig.json
+-- openapi.json
+-- src/
    +-- index.ts
    +-- types/
    |   +-- index.ts, store.ts, auth.ts, table.ts, menu.ts, order.ts, recommendation.ts, common.ts
    +-- api/
    |   +-- index.ts, client.ts, auth.ts, stores.ts, tables.ts, menus.ts, option-groups.ts, orders.ts, recommendations.ts
    +-- mocks/
    |   +-- index.ts, browser.ts
    |   +-- data/ (시드 데이터)
    |   +-- handlers/ (auth, stores, tables, menus, option-groups, orders, recommendations, index)
    +-- hooks/
    |   +-- index.ts, useAuth.ts
    +-- utils/
        +-- index.ts, format.ts, validation.ts, storage.ts
```
