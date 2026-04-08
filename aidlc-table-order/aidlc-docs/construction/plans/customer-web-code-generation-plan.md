# customer-web Code Generation 계획

> **유닛**: customer-web (고객용 SPA)
> **Phase**: Phase 2 (shared 완료 후 병렬 개발)
> **목적**: 고객 주문 인터페이스 - 메뉴 탐색, 장바구니, 추천, 주문, 대기/영수증
> **이 문서가 Code Generation의 유일한 진실 소스(Single Source of Truth)입니다.**

---

## 유닛 컨텍스트

### 담당 스토리 (16개)
| Epic | 스토리 | 제목 | 주요 기능 |
|------|--------|------|-----------|
| 1 | US-01 | 테이블 태블릿 자동 로그인 | 자동 로그인 화면, 인증 Context |
| 2 | US-03 | 카테고리 사이드바로 메뉴 탐색 | 카테고리 사이드바, 스크롤 연동 |
| 2 | US-04 | 카테고리별 영역 구분된 메뉴 목록 | 카테고리 소제목, 구분선 |
| 2 | US-05 | 인기 메뉴 확인 | 인기 뱃지 표시 |
| 2 | US-06 | 메뉴 옵션 선택 | 옵션 선택 UI, 옵션 없는 메뉴 툴팁 |
| 3 | US-07 | 장바구니에 메뉴 추가 | Context + localStorage |
| 3 | US-08 | 장바구니 수정 및 삭제 | 수량 변경, 삭제, 비우기 |
| 3 | US-09 | 장바구니 유지 (새로고침) | localStorage 영속화 |
| 4 | US-10 | 함께 주문한 메뉴 추천 | 추천 바텀시트 UI |
| 4 | US-11 | 주문 확정 | 주문 확정 화면, 계산 안내 멘트 |
| 4 | US-12 | 추가 주문 (n회차) | 추가 주문 플로우 |
| 5 | US-13 | 주문 진행 상황 확인 | 대기 화면, 모래시계, % |
| 5 | US-14 | 대기 화면에서 영수증 확인 | 영수증 확인 UI, 회차 뱃지 |
| 5 | US-15 | 주문 내역 조회 | 주문 내역 화면, total 표시 |
| 9 | US-24 | 네트워크 오류 처리 | 네트워크 에러 UI |
| 9 | US-25 | 세션 만료 처리 | 자동 재인증 |

### 의존성
- **선행**: `packages/shared` (완료) - 타입, API 클라이언트, MSW mock, useAuth, 유틸리티
- **병렬**: `backend-api`, `admin-web` (독립)
- **MSW mock 기반 개발**: 백엔드 완성 전 MSW로 모든 API 응답 처리

### 기술 스택
- **프레임워크**: React 18 + TypeScript
- **빌드**: Vite
- **라우팅**: React Router v6
- **서버 상태**: TanStack Query v5
- **로컬 상태**: Context API + useReducer
- **스타일**: CSS Modules (모바일 최적화)
- **테스트**: Vitest + React Testing Library
- **자동화 친화적**: 모든 인터랙티브 요소에 `data-testid` 속성

### 코드 위치
- **애플리케이션 코드**: `apps/customer/` (워크스페이스 루트 기준)
- **문서**: `aidlc-docs/construction/customer-web/code/`

---

## 생성 계획

### Step 1: 프로젝트 구조 설정 (Greenfield) ✅
- [x] `apps/customer/package.json` - 의존성 정의 (react, react-dom, react-router-dom, @tanstack/react-query, @table-order/shared)
- [x] `apps/customer/tsconfig.json` - TypeScript 설정
- [x] `apps/customer/vite.config.ts` - Vite 설정 (프록시, 경로 별칭)
- [x] `apps/customer/index.html` - HTML 엔트리포인트
- [x] `apps/customer/src/main.tsx` - React 진입점 + MSW 초기화
- [x] `apps/customer/src/vite-env.d.ts` - Vite 타입 선언

### Step 2: 라우팅 및 앱 쉘 (US-01 기반) ✅
- [x] `apps/customer/src/App.tsx` - React Router 설정, 라우트 정의
- [x] `apps/customer/src/layouts/CustomerLayout.tsx` - 공통 레이아웃 (헤더: 테이블번호 표시)
- [x] 라우트 구성:
  - `/` → 메뉴 페이지 (기본)
  - `/menu/:menuId` → 메뉴 상세 (옵션 선택)
  - `/cart` → 장바구니
  - `/checkout` → 주문 확정
  - `/waiting` → 대기 화면
  - `/orders` → 주문 내역
  - `/receipt` → 영수증
  - `/setup` → 초기 설정 안내 (인증 실패 시)

### Step 3: Context 생성 (US-01, US-07, US-08, US-09, US-24, US-25) ✅
- [x] `apps/customer/src/contexts/AuthContext.tsx` - 인증 상태 관리
  - shared의 `useAuth` 래핑
  - 자동 로그인 로직 (`authApi.tableAutoLogin`)
  - 세션 만료 시 자동 재인증 (US-25)
  - localStorage에서 store_id, table_number, password 읽기
  - 인증 실패 시 `/setup` 리다이렉트
- [x] `apps/customer/src/contexts/CartContext.tsx` - 장바구니 상태 관리
  - shared의 `CartItem`, `loadCart`, `saveCart`, `clearCart`, `generateCartItemId` 사용
  - addItem, updateQuantity, removeItem, clearAll 액션
  - useReducer + localStorage 동기화 (US-09)
  - 총 금액 계산
- [x] `apps/customer/src/contexts/ErrorContext.tsx` - 에러 상태 관리
  - 글로벌 에러 배너 상태
  - 네트워크 에러 처리 (US-24)
  - 에러 타입 분류 (network, server, auth)

### Step 4: 커스텀 훅 (TanStack Query) ✅
- [x] `apps/customer/src/hooks/useMenus.ts` - 메뉴 관련 쿼리 (US-03, US-04, US-05, US-06)
- [x] `apps/customer/src/hooks/useOrders.ts` - 주문 관련 쿼리/뮤테이션 (US-11, US-12, US-13, US-15)
- [x] `apps/customer/src/hooks/useReceipt.ts` - 영수증 관련 쿼리 (US-14)
- [x] `apps/customer/src/hooks/useRecommendations.ts` - 추천 관련 쿼리 (US-10)
- [x] `apps/customer/src/hooks/index.ts` - re-export

### Step 5: 메뉴 탐색 페이지 및 컴포넌트 (US-03, US-04, US-05, US-06) ✅
- [x] `apps/customer/src/pages/MenuPage.tsx` - 메뉴 탐색 메인 페이지
  - 카테고리 사이드바 + 메뉴 목록 2단 레이아웃
  - 스크롤 시 사이드바 하이라이트 연동 (IntersectionObserver)
  - 사이드바 카테고리 클릭 시 해당 영역 스크롤 (scrollIntoView)
  - 하단 고정 장바구니 FAB 버튼 (수량 뱃지)
- [x] `apps/customer/src/pages/MenuPage.module.css` - 메뉴 페이지 스타일
- [x] `apps/customer/src/components/CategorySidebar.tsx` - 카테고리 사이드바 (US-03)
  - 카테고리 목록 세로 배치
  - 현재 활성 카테고리 하이라이트
  - `data-testid="category-sidebar-{categoryId}"`
- [x] `apps/customer/src/components/MenuSection.tsx` - 카테고리별 메뉴 섹션 (US-04)
- [x] `apps/customer/src/components/MenuCard.tsx` - 메뉴 카드 (US-04, US-05)
- [x] `apps/customer/src/components/MenuCard.module.css` - 메뉴 카드 스타일
- [x] `apps/customer/src/components/AddedTooltip.tsx` - 장바구니 추가 확인 툴팁 (US-06)

### Step 6: 메뉴 상세 / 옵션 선택 (US-06) ✅
- [x] `apps/customer/src/pages/MenuDetailPage.tsx` - 메뉴 상세 페이지
  - 메뉴 이미지, 이름, 설명, 기본 가격
  - 옵션 그룹 목록 (OptionSelector)
  - 수량 선택
  - 총 가격 실시간 계산
  - "장바구니 추가" 버튼
  - `data-testid="menu-detail-add-to-cart"`
- [x] `apps/customer/src/pages/MenuDetailPage.module.css` - 상세 페이지 스타일
- [x] `apps/customer/src/components/OptionSelector.tsx` - 옵션 그룹 선택 UI (US-06)
  - 필수 옵션: 라디오 버튼 스타일 (단일 선택)
  - 선택 옵션: 체크박스 스타일 (다중 선택)
  - 추가 가격 표시
  - 필수 미선택 시 안내 메시지
  - `data-testid="option-group-{groupId}"`
- [x] `apps/customer/src/components/QuantitySelector.tsx` - 수량 증감 UI

### Step 7: 장바구니 페이지 (US-07, US-08, US-09) ✅
- [x] `apps/customer/src/pages/CartPage.tsx` - 장바구니 페이지
  - 장바구니 항목 리스트 (메뉴명, 옵션, 수량, 소계)
  - 항목별 수량 증감 / 삭제 (US-08)
  - "장바구니 비우기" 버튼 (US-08)
  - 총 금액 표시
  - "주문하기" 버튼 → 추천 바텀시트 또는 주문 확정
  - 빈 장바구니 안내 UI
  - `data-testid="cart-order-button"`, `data-testid="cart-clear-button"`
- [x] `apps/customer/src/pages/CartPage.module.css` - 장바구니 스타일
- [x] `apps/customer/src/components/CartItem.tsx` - 장바구니 항목 카드
  - 메뉴명, 선택 옵션 목록, 수량 증감, 소계, 삭제 버튼
  - `data-testid="cart-item-{cartItemId}"`

### Step 8: 추천 및 주문 확정 (US-10, US-11, US-12) ✅
- [x] `apps/customer/src/components/RecommendationSheet.tsx` - 추천 바텀시트 (US-10)
  - 주문하기 클릭 시 추천 API 호출
  - 추천 메뉴 카드 (이미지, 이름, 가격)
  - "추가하기" 버튼 → 장바구니에 추가
  - "바로 주문하기" / "추천 건너뛰기" 버튼
  - 추천 없으면 바로 주문 확정 이동
  - `data-testid="recommendation-sheet"`, `data-testid="recommendation-skip"`
- [x] `apps/customer/src/components/RecommendationSheet.module.css` - 바텀시트 스타일
- [x] `apps/customer/src/pages/CheckoutPage.tsx` - 주문 확정 페이지 (US-11)
  - 최종 주문 내역 확인 (메뉴, 옵션, 수량, 금액)
  - "계산은 매장 나가기 할 때 프론트에서 해주세요" 안내 멘트
  - "주문 확정" 버튼 → `ordersApi.createOrder`
  - 성공 시: 주문번호 표시 + 장바구니 비우기 + 메뉴 화면 리다이렉트
  - 실패 시: 에러 메시지 표시 + 장바구니 유지
  - 추가 주문(n회차) 동일 플로우 (US-12: round가 자동 증가됨)
  - `data-testid="checkout-confirm-button"`
- [x] `apps/customer/src/pages/CheckoutPage.module.css` - 주문 확정 스타일

### Step 9: 대기 화면 및 영수증 (US-13, US-14) ✅
- [x] `apps/customer/src/pages/WaitingPage.tsx` - 주문 대기 페이지 (US-13)
  - "주문 접수 → 준비 중 → 서빙 대기" 진행 단계 표시
  - 모래시계 애니메이션 + 진행 % (useOrderProgress 폴링)
  - 추가 주문 시 시간 증가 반영
  - "영수증 보기" 버튼 → 영수증 페이지 (US-14)
  - "추가 주문" 버튼 → 메뉴 페이지
  - `data-testid="waiting-progress"`
- [x] `apps/customer/src/pages/WaitingPage.module.css` - 대기 화면 스타일
- [x] `apps/customer/src/components/OrderProgress.tsx` - 진행 상태 표시 컴포넌트
  - 3단계 프로그레스 바 (pending → preparing → completed)
  - 현재 단계 하이라이트
  - `data-testid="order-progress-bar"`
- [x] `apps/customer/src/components/HourglassAnimation.tsx` - 모래시계 애니메이션
- [x] `apps/customer/src/pages/ReceiptPage.tsx` - 영수증 페이지 (US-14)
  - 회차별 주문 항목 (ReceiptRound)
  - "n회차 추가 주문" 뱃지
  - 옵션, 금액, 합계 표시
  - `data-testid="receipt-round-{round}"`
- [x] `apps/customer/src/pages/ReceiptPage.module.css` - 영수증 스타일

### Step 10: 주문 내역 페이지 (US-15) ✅
- [x] `apps/customer/src/pages/OrderHistoryPage.tsx` - 주문 내역 페이지
  - 세션 주문 목록 (시간순)
  - 주문번호, 시각, 메뉴+옵션, 수량, 금액, 상태, 회차 뱃지
  - 하단 전체 total 주문 금액 표시
  - 현재 세션만 표시
  - `data-testid="order-history-total"`
- [x] `apps/customer/src/pages/OrderHistoryPage.module.css` - 주문 내역 스타일
- [x] `apps/customer/src/components/OrderStatusBadge.tsx` - 주문 상태 뱃지 공통 컴포넌트
  - pending: 대기중 (노란색)
  - preparing: 준비중 (파란색)
  - completed: 완료 (초록색)
- [x] `apps/customer/src/components/RoundBadge.tsx` - 회차 뱃지 공통 컴포넌트

### Step 11: 에러 처리 컴포넌트 (US-24, US-25) ✅
- [x] `apps/customer/src/components/ErrorBanner.tsx` - 글로벌 에러 배너 (US-24)
  - 네트워크 에러: "네트워크 연결을 확인해 주세요"
  - 서버 에러: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요"
  - 자동 해제 (5초) 또는 수동 닫기
  - `data-testid="error-banner"`
- [x] `apps/customer/src/components/ErrorFallback.tsx` - 에러 폴백 화면 (US-24)
- [x] `apps/customer/src/pages/SetupGuidePage.tsx` - 초기 설정 안내 (US-01, US-25)

### Step 12: 글로벌 스타일 및 공통 CSS ✅
- [x] `apps/customer/src/styles/global.css` - 글로벌 스타일 (리셋, 폰트, 변수)
  - CSS 변수 (색상, 간격, 폰트 사이즈)
  - 모바일 최적화 (viewport, touch-action)
- [x] `apps/customer/src/styles/variables.css` - 디자인 토큰 (색상, 사이즈 변수)

### Step 13: 단위 테스트 ✅
- [x] `apps/customer/src/__tests__/contexts/CartContext.test.tsx` - 장바구니 Context 테스트
  - addItem, updateQuantity, removeItem, clearAll 테스트
  - localStorage 동기화 검증
- [x] `apps/customer/src/__tests__/hooks/useMenus.test.tsx` - 메뉴 훅 테스트
- [x] `apps/customer/src/__tests__/hooks/useOrders.test.tsx` - 주문 훅 테스트
- [x] `apps/customer/src/__tests__/components/MenuCard.test.tsx` - 메뉴 카드 테스트
- [x] `apps/customer/src/__tests__/components/CartItem.test.tsx` - 장바구니 항목 테스트
- [x] `apps/customer/src/__tests__/pages/CheckoutPage.test.tsx` - 주문 확정 테스트
- [x] `apps/customer/vitest.config.ts` - Vitest 설정
- [x] `apps/customer/src/__tests__/setup.ts` - 테스트 setup (MSW)

### Step 14: 문서화 ✅
- [x] `aidlc-docs/construction/customer-web/code/code-summary.md` - 생성된 코드 요약

---

## 파일 목록 (예상 ~50개)

```
apps/customer/
+-- package.json
+-- tsconfig.json
+-- vite.config.ts
+-- vitest.config.ts
+-- index.html
+-- src/
    +-- main.tsx
    +-- App.tsx
    +-- vite-env.d.ts
    +-- layouts/
    |   +-- CustomerLayout.tsx
    +-- pages/
    |   +-- MenuPage.tsx
    |   +-- MenuPage.module.css
    |   +-- MenuDetailPage.tsx
    |   +-- MenuDetailPage.module.css
    |   +-- CartPage.tsx
    |   +-- CartPage.module.css
    |   +-- CheckoutPage.tsx
    |   +-- CheckoutPage.module.css
    |   +-- WaitingPage.tsx
    |   +-- WaitingPage.module.css
    |   +-- ReceiptPage.tsx
    |   +-- ReceiptPage.module.css
    |   +-- OrderHistoryPage.tsx
    |   +-- OrderHistoryPage.module.css
    |   +-- SetupGuidePage.tsx
    +-- components/
    |   +-- CategorySidebar.tsx
    |   +-- MenuSection.tsx
    |   +-- MenuCard.tsx
    |   +-- MenuCard.module.css
    |   +-- AddedTooltip.tsx
    |   +-- OptionSelector.tsx
    |   +-- QuantitySelector.tsx
    |   +-- CartItem.tsx
    |   +-- RecommendationSheet.tsx
    |   +-- RecommendationSheet.module.css
    |   +-- OrderProgress.tsx
    |   +-- HourglassAnimation.tsx
    |   +-- OrderStatusBadge.tsx
    |   +-- RoundBadge.tsx
    |   +-- ErrorBanner.tsx
    |   +-- ErrorFallback.tsx
    +-- contexts/
    |   +-- AuthContext.tsx
    |   +-- CartContext.tsx
    |   +-- ErrorContext.tsx
    +-- hooks/
    |   +-- index.ts
    |   +-- useMenus.ts
    |   +-- useOrders.ts
    |   +-- useReceipt.ts
    |   +-- useRecommendations.ts
    +-- styles/
    |   +-- global.css
    |   +-- variables.css
    +-- __tests__/
        +-- setup.ts
        +-- contexts/
        |   +-- CartContext.test.tsx
        +-- hooks/
        |   +-- useMenus.test.tsx
        |   +-- useOrders.test.tsx
        +-- components/
        |   +-- MenuCard.test.tsx
        |   +-- CartItem.test.tsx
        +-- pages/
            +-- CheckoutPage.test.tsx
```

---

## 스토리 커버리지 매핑

| Step | 관련 스토리 |
|------|------------|
| Step 1 | - (인프라) |
| Step 2 | US-01 (라우팅) |
| Step 3 | US-01, US-07, US-08, US-09, US-24, US-25 |
| Step 4 | US-03~06, US-10~15 |
| Step 5 | US-03, US-04, US-05, US-06 |
| Step 6 | US-06 |
| Step 7 | US-07, US-08, US-09 |
| Step 8 | US-10, US-11, US-12 |
| Step 9 | US-13, US-14 |
| Step 10 | US-15 |
| Step 11 | US-24, US-25 |
| Step 12 | - (공통 스타일) |
| Step 13 | - (테스트) |
| Step 14 | - (문서) |
