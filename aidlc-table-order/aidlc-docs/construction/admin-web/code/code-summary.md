# admin-web 코드 요약

## 생성 파일 목록 (53개)

### 프로젝트 설정 (6개)
- `apps/admin/package.json` — 의존성 (React 19, TanStack Query, @dnd-kit, shadcn/ui)
- `apps/admin/tsconfig.json` — TypeScript 설정 (strict, 경로 alias @/)
- `apps/admin/tsconfig.node.json` — Vite용 Node 설정
- `apps/admin/vite.config.ts` — Vite + React + Tailwind, 포트 5174, API proxy
- `apps/admin/components.json` — shadcn/ui CLI 설정
- `apps/admin/index.html` — HTML 엔트리 (다크 테마)

### 엔트리 및 스타일 (3개)
- `src/main.tsx` — React 엔트리 + MSW 워커 초기화 + QueryClientProvider
- `src/index.css` — Tailwind + 다크 프리미엄 테마 (앰버/골드 포인트)
- `src/lib/utils.ts` — cn() 헬퍼 (clsx + tailwind-merge)

### shadcn/ui 컴포넌트 (14개, CLI 설치)
- `ui/button.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/card.tsx`
- `ui/dialog.tsx`, `ui/badge.tsx`, `ui/select.tsx`, `ui/table.tsx`
- `ui/sonner.tsx`, `ui/switch.tsx`, `ui/textarea.tsx`, `ui/alert.tsx`
- `ui/tabs.tsx`, `ui/separator.tsx`

### 라우팅 및 레이아웃 (4개)
- `src/App.tsx` — React Router 라우트 정의 (6개 경로)
- `components/layout/AdminLayout.tsx` — 사이드바 + 헤더 + 콘텐츠 영역
- `components/layout/Sidebar.tsx` — 네비게이션 (대시보드, 메뉴, 옵션, 테이블)
- `components/layout/Header.tsx` — 매장 정보 + 로그아웃

### 인증 (3개)
- `components/layout/ProtectedRoute.tsx` — 인증 가드 (관리자만)
- `contexts/AuthContext.tsx` — 인증 상태 관리 (shared useAuth 래핑)
- `pages/LoginPage.tsx` — 관리자 로그인 폼

### 대시보드 (7개)
- `pages/DashboardPage.tsx` — 테이블 그리드 + 폴링 상태
- `hooks/usePolling.ts` — TanStack Query 2초 폴링 (since 파라미터)
- `components/dashboard/TableGrid.tsx` — 그리드 레이아웃 + 필터 (전체/이용중/빈/신규)
- `components/dashboard/TableCard.tsx` — 테이블 카드 (번호, 금액, 미리보기, 신규 강조)
- `components/dashboard/OrderDetailModal.tsx` — 주문 상세 + 상태변경 + 삭제 + 이용완료
- `components/dashboard/OrderStatusBadge.tsx` — 상태 뱃지 (대기중/준비중/완료)
- `components/dashboard/PollingStatusIndicator.tsx` — 폴링 연결 상태 표시

### 테이블 관리 (3개)
- `pages/TableSetupPage.tsx` — 테이블 등록 폼 + 목록
- `pages/TableHistoryPage.tsx` — 과거 주문 내역 + 날짜 필터
- `hooks/useTables.ts` — 테이블 CRUD 훅

### 메뉴 관리 (4개)
- `pages/MenuManagementPage.tsx` — 카테고리 탭 + 메뉴 목록/순서변경
- `hooks/useMenus.ts` — 메뉴 CRUD + 카테고리 + 순서 훅
- `components/menu/MenuList.tsx` — 메뉴 테이블 (이름, 가격, 인기, 판매 토글)
- `components/menu/MenuFormDialog.tsx` — 메뉴 등록/수정 다이얼로그
- `components/menu/MenuSortable.tsx` — @dnd-kit 드래그앤드롭 순서 변경

### 옵션 그룹 관리 (4개)
- `pages/OptionGroupPage.tsx` — 옵션 그룹 목록 + CRUD
- `hooks/useOptionGroups.ts` — 옵션 그룹 CRUD + 메뉴 연결/해제 훅
- `components/option/OptionGroupList.tsx` — 그룹 목록 (이름, 필수/선택, 항목)
- `components/option/OptionGroupFormDialog.tsx` — 그룹 생성/수정 (동적 항목 추가)
- `components/option/MenuOptionLinker.tsx` — 메뉴-옵션 연결 UI

### 공통 컴포넌트 (3개)
- `components/common/ConfirmDialog.tsx` — 확인/취소 다이얼로그
- `components/common/LoadingSpinner.tsx` — 로딩 스피너
- `components/common/ErrorFallback.tsx` — 에러 UI + 재시도

---

## 스토리 커버리지

| 스토리 | 구현 위치 | 상태 |
|--------|-----------|------|
| US-02 (테이블 초기 설정) | TableSetupPage | ✅ |
| US-16 (관리자 로그인) | LoginPage, AuthContext | ✅ |
| US-17 (실시간 대시보드) | DashboardPage, TableGrid, TableCard, usePolling | ✅ |
| US-18 (주문 상세/상태변경) | OrderDetailModal, OrderStatusBadge | ✅ |
| US-19 (주문 삭제) | OrderDetailModal + ConfirmDialog | ✅ |
| US-20 (이용 완료) | OrderDetailModal + ConfirmDialog | ✅ |
| US-21 (과거 내역) | TableHistoryPage | ✅ |
| US-22 (메뉴 CRUD) | MenuManagementPage, MenuList, MenuFormDialog, MenuSortable | ✅ |
| US-23 (옵션 그룹) | OptionGroupPage, OptionGroupList, OptionGroupFormDialog, MenuOptionLinker | ✅ |
| US-26 (폴링 실패) | PollingStatusIndicator | ✅ |

**10/10 스토리 커버리지 완료**

---

## 아키텍처 요약

| 항목 | 선택 |
|------|------|
| 프레임워크 | React 19 + Vite 6 + TypeScript 5.7 |
| 상태 관리 | TanStack Query 5 (서버) + Context API (인증) |
| UI 라이브러리 | Tailwind CSS 4 + shadcn/ui (CLI 설치, 14개 컴포넌트) |
| 드래그앤드롭 | @dnd-kit |
| 알림 | sonner (toast) |
| 아이콘 | lucide-react |
| API 전략 | shared 패키지 API 클라이언트 + MSW mock (개발) |
| 테마 | 다크 프리미엄 (다크 네이비 배경, 앰버/골드 포인트) |
| 접근성 | Radix UI primitives (shadcn 기반), data-testid 전 요소 |
