# 유닛 의존성

## 의존성 매트릭스

| 유닛 | shared | backend-api | customer-web | admin-web |
|------|--------|-------------|-------------|-----------|
| **shared** | - | 없음 | 의존됨 | 의존됨 |
| **backend-api** | 없음 | - | 의존됨 | 의존됨 |
| **customer-web** | 의존 | 의존 (API) | - | 없음 |
| **admin-web** | 의존 | 의존 (API) | 없음 | - |

## 의존성 그래프

```
          shared (Unit 1)
          /           \
         v             v
customer-web       admin-web
  (Unit 3)          (Unit 4)
         \             /
          v           v
        backend-api (Unit 2)
             |
             v
         PostgreSQL + S3
```

## 의존성 상세

### shared → customer-web, admin-web
- **유형**: 빌드 타임 의존성 (npm workspace)
- **내용**: API 클라이언트, TypeScript 타입, 공통 훅, 유틸리티
- **영향**: shared 변경 시 양쪽 앱 재빌드 필요

### backend-api → customer-web, admin-web
- **유형**: 런타임 의존성 (HTTP REST API)
- **내용**: 28개 API 엔드포인트
- **영향**: API 스키마 변경 시 프론트엔드 타입 업데이트 필요

### backend-api → PostgreSQL
- **유형**: 런타임 의존성 (데이터 영속화)
- **내용**: SQLAlchemy ORM 통한 DB 접근

### backend-api → AWS S3
- **유형**: 런타임 의존성 (파일 저장)
- **내용**: 메뉴 이미지 업로드/조회

## 개발 순서 및 통합 전략

| Phase | 유닛 | 선행 조건 | 통합 테스트 시점 |
|-------|------|-----------|-----------------|
| 1 | shared | 없음 | 타입 체크, 유닛 테스트 |
| 2 | backend-api + customer-web | shared 완료 | API 통합 테스트 (고객 플로우) |
| 3 | admin-web | shared + backend-api 완료 | API 통합 테스트 (관리자 플로우) |
| 최종 | 전체 | 모든 유닛 완료 | E2E 테스트 |
