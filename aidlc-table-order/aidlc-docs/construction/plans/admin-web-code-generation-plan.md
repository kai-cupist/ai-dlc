# admin-web 코드 생성 계획

> **유닛**: Unit 4 - admin-web  
> **기술 스택**: React + Vite + TypeScript + TanStack Query + Tailwind CSS + shadcn/ui  
> **최적화**: 데스크톱 웹, 그리드 레이아웃  
> **API 전략**: MSW mock 핸들러 사용 (shared 패키지) → 백엔드 완성 시 실제 API 전환  
> **할당 스토리**: 10개 (US-02, US-16~US-23, US-26)

---

## Step 1: 프로젝트 초기 설정

Vite + React + TypeScript 프로젝트 생성, Tailwind CSS + shadcn/ui 설정, shared 패키지 연동

### 생성 파일
- [x] `apps/admin/package.json` — 의존성 (react, react-dom, react-router-dom, @tanstack/react-query, tailwindcss, shared 패키지 등)
- [x] `apps/admin/tsconfig.json` — TypeScript 설정 (shared 패키지 경로 매핑)
- [x] `apps/admin/tsconfig.node.json` — Vite용 Node TS 설정
- [x] `apps/admin/vite.config.ts` — Vite 설정 (포트, proxy, 경로 alias)
- [x] `apps/admin/index.html` — HTML 엔트리
- [x] `apps/admin/src/main.tsx` — React 엔트리 + MSW 워커 초기화 + QueryClientProvider
- [x] `apps/admin/src/index.css` — Tailwind 디렉티브 + CSS 변수 (다크 프리미엄 테마)
- [x] `apps/admin/src/lib/utils.ts` — cn() 헬퍼 (shadcn/ui용 clsx + tailwind-merge)

### shadcn/ui 컴포넌트 (CLI 공식 설치)
- [x] `npx shadcn@latest init --defaults` 실행
- [x] 필요한 컴포넌트 CLI 추가: button, input, label, card, dialog, badge, select, table, sonner, switch, textarea, alert, tabs, separator (14개)

---

## Step 2: 라우팅 및 레이아웃

React Router 설정, 관리자 레이아웃 (사이드바 + 헤더), 인증 가드

### 생성 파일
- [x] `apps/admin/src/App.tsx` — React Router 설정, 라우트 정의
- [x] `apps/admin/src/components/layout/AdminLayout.tsx` — 사이드바 + 헤더 + 콘텐츠 영역
- [x] `apps/admin/src/components/layout/Sidebar.tsx` — 네비게이션 메뉴 (대시보드, 메뉴 관리, 옵션 관리, 테이블 설정)
- [x] `apps/admin/src/components/layout/Header.tsx` — 매장 정보, 로그아웃 버튼
- [x] `apps/admin/src/components/layout/ProtectedRoute.tsx` — 인증 가드 (미인증 시 로그인 리다이렉트)
- [x] `apps/admin/src/components/common/LoadingSpinner.tsx` — 로딩 스피너
- [x] `apps/admin/src/components/common/ErrorFallback.tsx` — 에러 UI

### 라우트 구조
| 경로 | 페이지 | 인증 |
|------|--------|------|
| `/login` | LoginPage | 불필요 |
| `/` | DashboardPage | 필요 |
| `/menus` | MenuManagementPage | 필요 |
| `/option-groups` | OptionGroupPage | 필요 |
| `/tables/setup` | TableSetupPage | 필요 |
| `/tables/:tableId/history` | TableHistoryPage | 필요 |

### 스토리 매핑
- 전체 스토리에 공통 적용 (레이아웃 인프라)

---

## Step 3: 인증 Context + 로그인 페이지 (US-16)

shared의 useAuth 훅 기반 인증 Context, 관리자 로그인 화면

### 생성 파일
- [x] `apps/admin/src/contexts/AuthContext.tsx` — 인증 상태 관리 Context (shared useAuth 래핑, 로그인/로그아웃, 리다이렉트)
- [x] `apps/admin/src/pages/LoginPage.tsx` — 관리자 로그인 폼 (매장ID, 사용자명, 비밀번호), 에러 표시, 잠금 안내

### 스토리 매핑
- **US-16**: 관리자 로그인
  - 매장ID + 사용자명 + 비밀번호 입력
  - 로그인 성공 → 대시보드 이동
  - 5회 실패 → 잠금 안내
  - 새로고침 시 세션 유지

---

## Step 4: 실시간 주문 대시보드 (US-17, US-18, US-19, US-20, US-26)

그리드 대시보드, 테이블 카드, 2초 폴링, 주문 상세 모달, 상태 변경, 주문 삭제, 이용 완료

### 생성 파일
- [x] `apps/admin/src/pages/DashboardPage.tsx` — 대시보드 페이지 (테이블 그리드 + 필터)
- [x] `apps/admin/src/hooks/usePolling.ts` — TanStack Query 기반 2초 폴링 훅 (since 파라미터, 폴링 상태 추적)
- [x] `apps/admin/src/components/dashboard/TableGrid.tsx` — 테이블 카드 그리드 레이아웃 + 테이블 필터링
- [x] `apps/admin/src/components/dashboard/TableCard.tsx` — 테이블 카드 (번호, 총 주문액, 최신 주문 미리보기, 신규 강조)
- [x] `apps/admin/src/components/dashboard/OrderDetailModal.tsx` — 주문 상세 모달 (전체 메뉴+옵션+수량, 상태 변경 버튼)
- [x] `apps/admin/src/components/dashboard/OrderStatusBadge.tsx` — 주문 상태 뱃지 (pending/preparing/completed 색상)
- [x] `apps/admin/src/components/dashboard/PollingStatusIndicator.tsx` — 폴링 상태 표시 (연결중/실패 경고)
- [x] `apps/admin/src/components/common/ConfirmDialog.tsx` — 확인/취소 다이얼로그 (재사용)

### 스토리 매핑
- **US-17**: 그리드 대시보드, 테이블 카드, 2초 이내 업데이트, 신규 주문 강조, 테이블 필터
- **US-18**: 주문 카드 클릭 → 상세 모달, 상태 변경 (대기중→준비중→완료)
- **US-19**: 주문 삭제 확인 팝업 → 삭제 → 총 주문액 재계산 → 성공 피드백
- **US-20**: 이용 완료 확인 팝업 → 세션 종료 → 테이블 리셋
- **US-26**: 폴링 실패 경고 UI, 복구 시 최신 데이터 갱신

---

## Step 5: 테이블 설정 및 과거 내역 (US-02, US-21)

테이블 초기 설정 화면, 과거 주문 내역 조회

### 생성 파일
- [x] `apps/admin/src/pages/TableSetupPage.tsx` — 테이블 목록 + 초기 설정 폼 (매장ID, 테이블번호, 비밀번호)
- [x] `apps/admin/src/pages/TableHistoryPage.tsx` — 과거 주문 내역 (시간 역순, 날짜 필터)
- [x] `apps/admin/src/hooks/useTables.ts` — 테이블 관련 TanStack Query 훅 (목록, 이용 완료, 과거 내역)

### 스토리 매핑
- **US-02**: 테이블 초기 설정 (매장ID, 테이블번호, 비밀번호 입력 → 저장)
- **US-21**: 과거 주문 내역 (시간 역순, 날짜 필터, 닫기 → 대시보드)

---

## Step 6: 메뉴 관리 (US-22)

메뉴 CRUD, 노출 순서 조정, 카테고리별 관리

### 생성 파일
- [x] `apps/admin/src/pages/MenuManagementPage.tsx` — 메뉴 관리 페이지 (카테고리 탭 + 메뉴 목록)
- [x] `apps/admin/src/hooks/useMenus.ts` — 메뉴 CRUD TanStack Query 훅
- [x] `apps/admin/src/components/menu/MenuList.tsx` — 메뉴 목록 테이블 (이름, 가격, 카테고리, 인기, 가용, 순서)
- [x] `apps/admin/src/components/menu/MenuFormDialog.tsx` — 메뉴 등록/수정 다이얼로그 (메뉴명, 가격, 설명, 카테고리, 이미지 URL, 인기, 가용)
- [x] `apps/admin/src/components/menu/MenuSortable.tsx` — @dnd-kit 드래그앤드롭 순서 변경 UI

### 스토리 매핑
- **US-22**: 메뉴 등록/수정/삭제, 필수 필드 검증, 노출 순서 변경

---

## Step 7: 옵션 그룹 관리 (US-23)

옵션 그룹 CRUD, 옵션 항목 관리, 메뉴-옵션 연결

### 생성 파일
- [x] `apps/admin/src/pages/OptionGroupPage.tsx` — 옵션 그룹 관리 페이지
- [x] `apps/admin/src/hooks/useOptionGroups.ts` — 옵션 그룹 CRUD TanStack Query 훅
- [x] `apps/admin/src/components/option/OptionGroupList.tsx` — 옵션 그룹 목록 (그룹명, 필수/선택, 항목 수, 연결된 메뉴 수)
- [x] `apps/admin/src/components/option/OptionGroupFormDialog.tsx` — 옵션 그룹 생성/수정 다이얼로그 (그룹명, 필수/선택, 항목 목록 + 추가 가격)
- [x] `apps/admin/src/components/option/MenuOptionLinker.tsx` — 메뉴-옵션 연결 관리 UI (체크박스 목록)

### 스토리 매핑
- **US-23**: 옵션 그룹 CRUD, 옵션 항목 추가 가격, 메뉴 연결/해제, 그룹 재사용

---

## Step 8: 문서화

코드 요약 문서 생성

### 생성 파일
- [x] `aidlc-docs/construction/admin-web/code/code-summary.md` — 생성 파일 목록, 스토리 커버리지, 아키텍처 요약

---

## 요약

| Step | 내용 | 파일 수 | 스토리 |
|------|------|---------|--------|
| 1 | 프로젝트 초기 설정 | ~24 | 공통 인프라 |
| 2 | 라우팅 및 레이아웃 | 7 | 공통 인프라 |
| 3 | 인증 + 로그인 | 2 | US-16 |
| 4 | 실시간 대시보드 | 8 | US-17, US-18, US-19, US-20, US-26 |
| 5 | 테이블 설정 + 내역 | 3 | US-02, US-21 |
| 6 | 메뉴 관리 | 5 | US-22 |
| 7 | 옵션 그룹 관리 | 5 | US-23 |
| 8 | 문서화 | 1 | - |
| **합계** | | **~55** | **10/10 스토리** |

## 의존 관계

```
Step 1 (설정)
  └─ Step 2 (라우팅/레이아웃)
       ├─ Step 3 (인증/로그인) ← 다른 모든 페이지의 전제
       ├─ Step 4 (대시보드)
       ├─ Step 5 (테이블)
       ├─ Step 6 (메뉴)
       └─ Step 7 (옵션)
  Step 8 (문서) ← 모든 Step 완료 후
```

## 사용하는 shared 패키지 모듈

| 모듈 | 사용처 |
|------|--------|
| `authApi` | 로그인 (adminLogin) |
| `ordersApi` | 대시보드 (polling, status, delete) |
| `tablesApi` | 테이블 (목록, 이용 완료, 과거 내역) |
| `menusApi` | 메뉴 CRUD |
| `optionGroupsApi` | 옵션 그룹 CRUD + 메뉴 연결 |
| `useAuth` | AuthContext 래핑 |
| `formatPrice`, `formatDateTime` | 금액/시간 포맷팅 |
| MSW mock 핸들러 | 개발 시 API mock |
| TypeScript 타입 전체 | 타입 안전성 |
