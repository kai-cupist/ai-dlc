# 유닛 분해 계획

## 실행 계획

### Phase 1: 유닛 정의
- [x] Unit 1: shared 패키지 정의 (TypeScript)
- [x] Unit 2: backend-api 정의 (Python + FastAPI)
- [x] Unit 3: customer-web 정의 (React + Vite)
- [x] Unit 4: admin-web 정의 (React + Vite)
- [x] unit-of-work.md 생성

### Phase 2: 의존성 매핑
- [x] 유닛 간 의존성 매트릭스 작성
- [x] 개발 순서 결정 (Phase 1: shared → Phase 2: backend+customer → Phase 3: admin)
- [x] unit-of-work-dependency.md 생성

### Phase 3: 스토리 매핑
- [x] US-01 ~ US-26을 유닛에 할당 (미할당 0개)
- [x] unit-of-work-story-map.md 생성

### Phase 4: 검증
- [x] 모든 스토리가 유닛에 할당되었는지 확인 ✅
- [x] 유닛 경계 및 의존성 검증 ✅

---

## 명확화 질문

## Question 1
유닛별 개발 순서 전략은 어떤 것을 선호하나요?

A) 백엔드 먼저 완성 → 프론트엔드 개발 (API가 준비된 상태에서 프론트엔드 작업)
B) 백엔드 + 고객앱 동시 → 관리자앱 (고객 플로우 우선 완성)
C) 모든 유닛 병렬 개발 (각 유닛 독립적으로 진행, Mock API 활용)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
shared 패키지를 별도 유닛으로 관리할까요, 아니면 프론트엔드 유닛에 포함할까요?

A) 별도 유닛 (Unit 4) - shared를 먼저 만들고 양쪽 앱에서 참조
B) customer-web에 포함 - shared 코드를 customer에서 먼저 만들고 admin에서 참조
C) 유닛으로 분리하지 않고 빌드 시 자동 공유 (모노레포 워크스페이스 기능 활용)
D) Other (please describe after [Answer]: tag below)

[Answer]: A
