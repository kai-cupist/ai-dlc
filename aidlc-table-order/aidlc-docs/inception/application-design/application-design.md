# 애플리케이션 설계 통합 문서

## 아키텍처 개요

| 항목 | 결정 |
|------|------|
| **백엔드 패턴** | 계층형 (Router → Service → Repository) + TDD |
| **백엔드 구조** | `app/` (비즈니스), `cores/` (공통 인프라), `tests/` |
| **프론트엔드 상태** | TanStack Query (서버) + Context API (로컬) |
| **코드 공유** | 모노레포 (shared 패키지 + customer 앱 + admin 앱) |
| **배포 인프라** | Docker + AWS ECS Fargate (Terraform IaC) |

## 시스템 구조

```
+--------------------------------------------------+
|                    Client Layer                   |
|  +-----------------------+ +-------------------+  |
|  | apps/customer (React) | | apps/admin (React)|  |
|  | - 모바일 최적화        | | - 데스크톱 최적화  |  |
|  | - TanStack Query      | | - TanStack Query  |  |
|  | - Context (장바구니)   | | - Context (인증)   |  |
|  +-----------+-----------+ +---------+---------+  |
|              |                       |             |
|  +-----------+-----------------------+-----------+ |
|  |           packages/shared                     | |
|  |   API Client, Types, Hooks, Utils            | |
|  +------------------------+----------------------+ |
+---------------------------|------------------------+
                            | REST API (HTTP)
+---------------------------|------------------------+
|                    Server Layer                    |
|  +---------------------------------------------+  |
|  |          FastAPI Application                 |  |
|  |  +--------+ +--------+ +--------+           |  |
|  |  | Auth   | | Menu   | | Order  |           |  |
|  |  | Router | | Router | | Router |           |  |
|  |  +---+----+ +---+----+ +---+----+           |  |
|  |      |          |          |                 |  |
|  |  +---+----+ +---+----+ +---+------+         |  |
|  |  | Auth   | | Menu   | | Order    |         |  |
|  |  |Service | |Service | | Service  |         |  |
|  |  +---+----+ +---+----+ +---+------+         |  |
|  |      |          |          |                 |  |
|  |  +---+----+ +---+----+ +---+------+         |  |
|  |  | Admin  | | Menu   | | Order    |         |  |
|  |  | Repo   | | Repo   | | Repo     |         |  |
|  |  +---+----+ +---+----+ +---+------+         |  |
|  +------|----------|----------|------------------+  |
+---------|----------|----------|---------------------+
          |          |          |
+---------|----------|----------|---------------------+
|  +------+----------+----------+-------------------+ |
|  |              PostgreSQL                        | |
|  |  stores, tables, sessions, menus, options,     | |
|  |  orders, order_items, order_history            | |
|  +------------------------------------------------+ |
|                    + AWS S3 (이미지)                  |
+------------------------------------------------------+
```

## 백엔드 컴포넌트 (6개)

| ID | 컴포넌트 | 핵심 책임 |
|----|----------|-----------|
| C1 | Auth | 관리자/테이블 인증, JWT, 브루트포스 방어 |
| C2 | Store | 매장 정보 관리 |
| C3 | Table | 테이블/세션 관리, 이용 완료 |
| C4 | Menu | 메뉴/카테고리/옵션 CRUD |
| C5 | Order | 주문 생성/상태/이력, 폴링, 영수증 |
| C6 | Recommendation | 주문 히스토리 기반 추천, 랜덤 폴백 |

## 프론트엔드 컴포넌트 (3개)

| ID | 컴포넌트 | 핵심 책임 |
|----|----------|-----------|
| F1 | packages/shared | API 클라이언트, 타입, 공통 훅/유틸 |
| F2 | apps/customer | 메뉴, 장바구니, 주문, 대기, 내역 |
| F3 | apps/admin | 로그인, 대시보드, 테이블/메뉴 관리 |

## API 엔드포인트 요약

| 그룹 | 엔드포인트 수 | 인증 |
|------|-------------|------|
| /api/auth | 4 | 미인증 (로그인), 인증 (갱신) |
| /api/stores | 1 | 인증 |
| /api/tables | 3 | 관리자 |
| /api/menus | 7 | 조회(테이블), CRUD(관리자) |
| /api/option-groups | 6 | 관리자 |
| /api/orders | 6 | 테이블(생성/조회), 관리자(상태/삭제/폴링) |
| /api/recommendations | 1 | 테이블 |
| **합계** | **28** | |

## 핵심 의존 관계

- `TableService → OrderService`: 이용 완료 시 주문 아카이빙
- `RecommendationService → OrderHistoryRepo`: 추천용 읽기 전용
- 나머지 서비스는 독립적

## Security Baseline 적용 포인트

| 규칙 | 적용 위치 |
|------|-----------|
| SECURITY-03 | StructuredLogger (전역) |
| SECURITY-04 | SecurityHeaders 미들웨어 |
| SECURITY-05 | Pydantic DTO 검증 (전 엔드포인트) |
| SECURITY-08 | JWTMiddleware, CORS 설정 |
| SECURITY-11 | RateLimiter (복합 키 기반: 미인증=IP+요청 파라미터, 인증=JWT subject) |
| SECURITY-12 | AuthService (bcrypt, 세션 관리, 브루트포스) |
| SECURITY-15 | ErrorHandler (글로벌 에러 핸들러) |

## 상세 문서 참조
- [components.md](components.md) - 컴포넌트 상세 정의
- [component-methods.md](component-methods.md) - 메서드 시그니처
- [services.md](services.md) - 서비스 오케스트레이션
- [component-dependency.md](component-dependency.md) - 의존성 및 데이터 플로우
