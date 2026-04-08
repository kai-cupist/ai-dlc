# 유닛 정의

## 개발 전략: Contract First (병렬 개발)

Phase 1에서 API 계약(타입 + Mock)을 확정한 후, Phase 2에서 백엔드와 프론트엔드를 병렬로 개발합니다.
프론트엔드는 MSW(Mock Service Worker)로 개발하며, 백엔드 완성 시 실제 API로 전환합니다.

## 유닛 목록

| 유닛 | 이름 | 기술 스택 | 설명 |
|------|------|-----------|------|
| Unit 1 | **shared** | TypeScript | API 계약 (타입, API 클라이언트, MSW mock 핸들러, 공통 훅/유틸) |
| Unit 2 | **backend-api** | Python + FastAPI + PostgreSQL | REST API 서버 (계약 구현) |
| Unit 3 | **customer-web** | React + Vite + TanStack Query | 고객용 SPA (모바일 최적화) |
| Unit 4 | **admin-web** | React + Vite + TanStack Query | 관리자용 SPA (데스크톱 최적화) |

---

## Unit 1: shared (API 계약 + 공유 코드)

| 항목 | 내용 |
|------|------|
| **목적** | API 계약 정의 및 고객/관리자 앱 간 공유 코드 |
| **책임** | OpenAPI 3.0 스펙 (Swagger), TypeScript 타입 정의 (API 요청/응답), Axios API 클라이언트, MSW mock 핸들러 (28개 엔드포인트), 공통 훅 (useAuth), 유틸리티 (포맷팅, 검증) |
| **산출물** | `packages/shared/` |
| **개발 순서** | **Phase 1** (최우선 - 이것이 병렬 개발의 기반) |

## Unit 2: backend-api (계약 구현)

| 항목 | 내용 |
|------|------|
| **목적** | API 계약의 실제 구현 (비즈니스 로직 + 데이터 관리) |
| **책임** | 인증(C1), 매장(C2), 테이블(C3), 메뉴(C4), 주문(C5), 추천(C6) 전체 API |
| **산출물** | `backend/` |
| **개발 순서** | **Phase 2** (shared 완료 후, customer-web/admin-web과 병렬) |
| **아키텍처** | 계층형 (Router → Service → Repository) + TDD |
| **배포** | Docker + AWS ECS Fargate (Terraform으로 인프라 관리) |

## Unit 3: customer-web (MSW mock → 실제 API)

| 항목 | 내용 |
|------|------|
| **목적** | 고객 주문 인터페이스 |
| **책임** | 메뉴 탐색, 옵션 선택, 장바구니, 추천, 주문, 대기 화면, 주문 내역 |
| **산출물** | `apps/customer/` |
| **개발 순서** | **Phase 2** (backend-api, admin-web과 병렬) |
| **상태 관리** | TanStack Query (서버) + Context (장바구니, 인증) |
| **개발 시 API** | MSW mock 핸들러 사용 → 백엔드 완성 시 실제 API로 전환 |

## Unit 4: admin-web (MSW mock → 실제 API)

| 항목 | 내용 |
|------|------|
| **목적** | 매장 관리 인터페이스 |
| **책임** | 관리자 로그인, 실시간 대시보드, 테이블 관리, 메뉴/옵션 관리 |
| **산출물** | `apps/admin/` |
| **개발 순서** | **Phase 2** (backend-api, customer-web과 병렬) |
| **상태 관리** | TanStack Query (서버, 2초 폴링) + Context (인증) |
| **개발 시 API** | MSW mock 핸들러 사용 → 백엔드 완성 시 실제 API로 전환 |

---

## 개발 순서 (Contract First 병렬 전략)

```
Phase 1: shared (API 계약 + 타입 + MSW mock 핸들러)
    |
    +------+----------+-----------+
    |      |          |           |
Phase 2: backend-api  customer-web  admin-web  (병렬 개발)
         (계약 구현)  (MSW mock)   (MSW mock)
```

---

## 코드 구성 (Greenfield)

```
aidlc-table-order/
+-- packages/
|   +-- shared/              # Unit 1: API 계약 + 공유 코드
|       +-- src/
|           +-- api/         # API 클라이언트 (Axios)
|           +-- types/       # TypeScript 타입 (요청/응답/엔티티)
|           +-- mocks/       # MSW mock 핸들러 (28개 엔드포인트)
|           +-- hooks/       # 공통 훅 (useAuth 등)
|           +-- utils/       # 유틸리티 (포맷팅, 검증)
|       +-- openapi.json     # OpenAPI 3.0 스펙 (Swagger 기반 계약)
+-- backend/                 # Unit 2: FastAPI 서버
|   +-- app/
|   |   +-- routers/         # API 라우터
|   |   +-- services/        # 비즈니스 로직
|   |   +-- repositories/    # 데이터 접근
|   |   +-- dto/             # Pydantic DTO (요청/응답)
|   +-- cores/
|   |   +-- db/
|   |   |   +-- models/      # SQLAlchemy 모델
|   |   |   +-- session.py   # DB 엔진/세션 설정
|   |   +-- security/        # JWT, 미들웨어, RateLimiter
|   |   +-- config.py        # 앱 설정
|   |   +-- logging.py       # 구조화된 로깅
|   +-- tests/               # 테스트 (TDD)
|   +-- Dockerfile           # 컨테이너 이미지 정의
|   +-- infra/               # Terraform IaC (ECS Fargate, ALB, RDS 등)
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
+-- docker-compose.yml       # 로컬 개발 환경 (Docker Compose)
+-- package.json             # 모노레포 루트
```
