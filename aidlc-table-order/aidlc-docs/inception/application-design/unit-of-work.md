# 유닛 정의

## 유닛 목록

| 유닛 | 이름 | 기술 스택 | 설명 |
|------|------|-----------|------|
| Unit 1 | **shared** | TypeScript | 공유 패키지 (API 클라이언트, 타입, 훅, 유틸) |
| Unit 2 | **backend-api** | Python + FastAPI + PostgreSQL | REST API 서버 |
| Unit 3 | **customer-web** | React + Vite + TanStack Query | 고객용 SPA (모바일 최적화) |
| Unit 4 | **admin-web** | React + Vite + TanStack Query | 관리자용 SPA (데스크톱 최적화) |

---

## Unit 1: shared

| 항목 | 내용 |
|------|------|
| **목적** | 고객/관리자 앱 간 공유 코드 |
| **책임** | API 클라이언트 (Axios), TypeScript 타입 정의, 공통 훅 (useAuth), 유틸리티 (포맷팅, 검증) |
| **산출물** | `packages/shared/` |
| **개발 순서** | Phase 1 (최우선) |

## Unit 2: backend-api

| 항목 | 내용 |
|------|------|
| **목적** | 비즈니스 로직 및 데이터 관리 |
| **책임** | 인증(C1), 매장(C2), 테이블(C3), 메뉴(C4), 주문(C5), 추천(C6) 전체 API |
| **산출물** | `backend/` |
| **개발 순서** | Phase 2 (shared와 동시 또는 직후) |
| **아키텍처** | 계층형 (Router → Service → Repository) + TDD |

## Unit 3: customer-web

| 항목 | 내용 |
|------|------|
| **목적** | 고객 주문 인터페이스 |
| **책임** | 메뉴 탐색, 옵션 선택, 장바구니, 추천, 주문, 대기 화면, 주문 내역 |
| **산출물** | `apps/customer/` |
| **개발 순서** | Phase 2 (backend-api와 동시) |
| **상태 관리** | TanStack Query (서버) + Context (장바구니, 인증) |

## Unit 4: admin-web

| 항목 | 내용 |
|------|------|
| **목적** | 매장 관리 인터페이스 |
| **책임** | 관리자 로그인, 실시간 대시보드, 테이블 관리, 메뉴/옵션 관리 |
| **산출물** | `apps/admin/` |
| **개발 순서** | Phase 3 (고객 플로우 완성 후) |
| **상태 관리** | TanStack Query (서버, 2초 폴링) + Context (인증) |

---

## 개발 순서

```
Phase 1: shared (공유 패키지 기반 구축)
    |
Phase 2: backend-api + customer-web (동시 개발, 고객 플로우 우선)
    |
Phase 3: admin-web (관리자 기능)
```

---

## 코드 구성 (Greenfield)

```
aidlc-table-order/
+-- packages/
|   +-- shared/              # Unit 1: 공유 패키지
|       +-- src/
|           +-- api/         # API 클라이언트
|           +-- types/       # TypeScript 타입
|           +-- hooks/       # 공통 훅
|           +-- utils/       # 유틸리티
+-- backend/                 # Unit 2: FastAPI 서버
|   +-- app/
|       +-- routers/         # API 라우터
|       +-- services/        # 비즈니스 로직
|       +-- repositories/    # 데이터 접근
|       +-- models/          # SQLAlchemy 모델
|       +-- schemas/         # Pydantic 스키마
|       +-- core/            # 설정, 보안, 미들웨어
|   +-- tests/               # 테스트 (TDD)
+-- apps/
|   +-- customer/            # Unit 3: 고객용 앱
|   |   +-- src/
|   |       +-- pages/       # 페이지 컴포넌트
|   |       +-- components/  # UI 컴포넌트
|   |       +-- contexts/    # Context (장바구니, 인증)
|   |       +-- hooks/       # 앱 전용 훅
|   +-- admin/               # Unit 4: 관리자용 앱
|       +-- src/
|           +-- pages/
|           +-- components/
|           +-- contexts/
|           +-- hooks/
+-- docker-compose.yml       # Docker 구성
+-- package.json             # 모노레포 루트
```
