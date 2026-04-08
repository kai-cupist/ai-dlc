# 유닛 의존성 (Contract First 병렬 전략)

## 의존성 매트릭스

| 유닛 | shared | backend-api | customer-web | admin-web |
|------|--------|-------------|-------------|-----------|
| **shared** | - | 없음 | 의존됨 | 의존됨 |
| **backend-api** | 계약 참조 | - | 없음 | 없음 |
| **customer-web** | 의존 (타입+mock) | 없음 (개발 시) | - | 없음 |
| **admin-web** | 의존 (타입+mock) | 없음 (개발 시) | 없음 | - |

> **핵심 변경**: 프론트엔드는 개발 시 backend-api에 직접 의존하지 않음. shared의 MSW mock을 사용하여 독립적으로 개발.

## 의존성 그래프

```
        shared (Unit 1) - API 계약 (OpenAPI + 타입 + MSW mock)
        /       |        \
       v        v         v
backend-api  customer-web  admin-web    ← Phase 2 (병렬)
(계약 구현)  (mock 사용)   (mock 사용)
     |
     v
PostgreSQL + S3
```

## 의존성 상세

### shared → customer-web, admin-web
- **유형**: 빌드 타임 의존성 (npm workspace)
- **내용**: OpenAPI 스펙, TypeScript 타입, API 클라이언트, MSW mock 핸들러, 공통 훅, 유틸리티
- **영향**: shared 변경 시 양쪽 앱 재빌드 필요

### shared → backend-api (계약 참조)
- **유형**: 설계 시 참조 (런타임 의존 아님)
- **내용**: OpenAPI 스펙을 기준으로 FastAPI 엔드포인트 구현
- **영향**: 계약 변경 시 backend-api DTO + 프론트엔드 타입 동시 업데이트

### backend-api → PostgreSQL
- **유형**: 런타임 의존성 (데이터 영속화)
- **내용**: SQLAlchemy ORM 통한 DB 접근

### backend-api → AWS S3
- **유형**: 런타임 의존성 (파일 저장)
- **내용**: 메뉴 이미지 업로드/조회

### 프론트엔드 → backend-api (통합 시점)
- **유형**: 런타임 의존성 (HTTP REST API) - 통합 테스트 시 연결
- **내용**: MSW mock → 실제 API 전환 (환경변수로 제어)
- **전환 방식**: `VITE_API_MODE=mock` → `VITE_API_MODE=real`

## 개발 순서 및 통합 전략

| Phase | 유닛 | 선행 조건 | 테스트 |
|-------|------|-----------|--------|
| 1 | **shared** | 없음 | 타입 체크, MSW 핸들러 유닛 테스트 |
| 2 | **backend-api** | shared (계약 참조) | TDD 단위 테스트, API 통합 테스트 |
| 2 | **customer-web** | shared (타입+mock) | MSW 기반 컴포넌트 테스트 |
| 2 | **admin-web** | shared (타입+mock) | MSW 기반 컴포넌트 테스트 |
| 통합 | backend + customer | Phase 2 완료 | Mock → 실제 API 전환 통합 테스트 |
| 통합 | backend + admin | Phase 2 완료 | Mock → 실제 API 전환 통합 테스트 |
| 최종 | 전체 | 모든 통합 완료 | E2E 테스트 (Cypress/Playwright) |
