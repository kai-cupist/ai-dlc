# customer-web Code Generation 요약

> **유닛**: customer-web (고객용 SPA)
> **생성일**: 2026-04-08
> **스토리 커버리지**: 16/16 (100%)

---

## 생성된 파일 (52개)

### 프로젝트 설정 (6개)
| 파일 | 역할 |
|------|------|
| `apps/customer/package.json` | 의존성 정의 |
| `apps/customer/tsconfig.json` | TypeScript 설정 |
| `apps/customer/vite.config.ts` | Vite 설정 (프록시, 별칭) |
| `apps/customer/vitest.config.ts` | Vitest 테스트 설정 |
| `apps/customer/index.html` | HTML 엔트리포인트 |
| `apps/customer/src/vite-env.d.ts` | Vite 타입 선언 |

### 진입점 및 라우팅 (3개)
| 파일 | 역할 |
|------|------|
| `src/main.tsx` | React 진입점 + MSW 초기화 |
| `src/App.tsx` | React Router 설정, 라우트 정의 |
| `src/layouts/CustomerLayout.tsx` | 공통 레이아웃 (헤더 + 테이블번호) |

### Context (3개)
| 파일 | 역할 | 스토리 |
|------|------|--------|
| `src/contexts/AuthContext.tsx` | 인증 상태, 자동 로그인, 재인증 | US-01, US-25 |
| `src/contexts/CartContext.tsx` | 장바구니 useReducer + localStorage | US-07~09 |
| `src/contexts/ErrorContext.tsx` | 글로벌 에러 상태 관리 | US-24 |

### 커스텀 훅 (5개)
| 파일 | 역할 | 스토리 |
|------|------|--------|
| `src/hooks/useMenus.ts` | 메뉴/카테고리 쿼리 | US-03~06 |
| `src/hooks/useOrders.ts` | 주문 생성/조회/진행 | US-11~13, US-15 |
| `src/hooks/useReceipt.ts` | 영수증 쿼리 | US-14 |
| `src/hooks/useRecommendations.ts` | 추천 쿼리 | US-10 |
| `src/hooks/index.ts` | re-export | - |

### 페이지 (8개 + CSS 8개 = 16개)
| 페이지 | 역할 | 스토리 |
|--------|------|--------|
| `MenuPage` | 메뉴 탐색 (사이드바 + 스크롤 연동) | US-03~05 |
| `MenuDetailPage` | 메뉴 상세 + 옵션 선택 | US-06 |
| `CartPage` | 장바구니 (추가/수정/삭제) | US-07~09 |
| `CheckoutPage` | 주문 확정 (계산 안내) | US-11, US-12 |
| `WaitingPage` | 대기 화면 (모래시계 + 진행률) | US-13 |
| `ReceiptPage` | 영수증 (회차별) | US-14 |
| `OrderHistoryPage` | 주문 내역 (total 포함) | US-15 |
| `SetupGuidePage` | 초기 설정 안내 | US-01, US-25 |

### 컴포넌트 (14개 + CSS 10개 = 24개)
| 컴포넌트 | 역할 | 스토리 |
|----------|------|--------|
| `CategorySidebar` | 카테고리 세로 목록 + 하이라이트 | US-03 |
| `MenuSection` | 카테고리별 섹션 (소제목 + 구분선) | US-04 |
| `MenuCard` | 메뉴 카드 (이름, 가격, 인기뱃지) | US-04, US-05 |
| `AddedTooltip` | 장바구니 추가 확인 툴팁 | US-06 |
| `OptionSelector` | 옵션 선택 UI (라디오/체크박스) | US-06 |
| `QuantitySelector` | 수량 증감 버튼 | US-06~08 |
| `CartItem` | 장바구니 항목 카드 | US-07, US-08 |
| `RecommendationSheet` | 추천 바텀시트 | US-10 |
| `OrderProgress` | 3단계 프로그레스 바 | US-13 |
| `HourglassAnimation` | 모래시계 + 진행률 % | US-13 |
| `OrderStatusBadge` | 주문 상태 뱃지 (대기/준비/완료) | US-15 |
| `RoundBadge` | 회차 뱃지 | US-14, US-15 |
| `ErrorBanner` | 글로벌 에러 배너 | US-24 |
| `ErrorFallback` | 에러 폴백 (재시도 버튼) | US-24 |

### 스타일 (2개)
| 파일 | 역할 |
|------|------|
| `src/styles/variables.css` | CSS 변수 (색상, 사이즈) |
| `src/styles/global.css` | 글로벌 리셋, 폰트 설정 |

### 테스트 (7개)
| 파일 | 테스트 대상 |
|------|------------|
| `__tests__/setup.ts` | 테스트 환경 설정 |
| `__tests__/contexts/CartContext.test.tsx` | 장바구니 CRUD + localStorage |
| `__tests__/hooks/useMenus.test.tsx` | 메뉴 쿼리 성공/에러 |
| `__tests__/hooks/useOrders.test.tsx` | 주문 생성/조회 |
| `__tests__/components/MenuCard.test.tsx` | 메뉴 카드 + 인기 뱃지 |
| `__tests__/components/CartItem.test.tsx` | 장바구니 항목 표시 |
| `__tests__/pages/CheckoutPage.test.tsx` | 주문 확정 UI |

---

## 기술 스택
- React 18 + TypeScript
- Vite (빌드)
- React Router v6 (라우팅)
- TanStack Query v5 (서버 상태)
- Context API + useReducer (로컬 상태)
- CSS Modules (스타일)
- Vitest + React Testing Library (테스트)
- MSW (개발 시 API mock)

## shared 패키지 의존성
- `@table-order/shared`: 타입, API 클라이언트, MSW mock, useAuth, 유틸리티, CartItem/storage

## 자동화 친화적 요소
- 모든 인터랙티브 요소에 `data-testid` 속성 부여
- 네이밍 규칙: `{component}-{element-role}` (예: `menu-card-menu-001`, `cart-order-button`)
