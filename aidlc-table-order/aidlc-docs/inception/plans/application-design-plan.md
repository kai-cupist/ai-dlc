# 애플리케이션 설계 계획

## 실행 계획

### Phase 1: 백엔드 컴포넌트 설계
- [ ] 인증 컴포넌트 (Auth) 정의
- [ ] 매장/테이블 컴포넌트 (Store/Table) 정의
- [ ] 메뉴 컴포넌트 (Menu) 정의
- [ ] 주문 컴포넌트 (Order) 정의
- [ ] 추천 컴포넌트 (Recommendation) 정의
- [ ] components.md 생성

### Phase 2: 컴포넌트 메서드 설계
- [ ] 각 컴포넌트의 메서드 시그니처 정의
- [ ] 입출력 타입 정의
- [ ] component-methods.md 생성

### Phase 3: 서비스 레이어 설계
- [ ] API 라우터/엔드포인트 구조 정의
- [ ] 서비스 오케스트레이션 패턴 정의
- [ ] services.md 생성

### Phase 4: 의존성 및 통신 패턴
- [ ] 컴포넌트 간 의존성 매트릭스
- [ ] 데이터 플로우 정의
- [ ] component-dependency.md 생성

### Phase 5: 통합 문서
- [ ] application-design.md 통합 문서 생성

---

## 설계 명확화 질문

## Question 1
백엔드 아키텍처 패턴은 어떤 것을 선호하나요?

A) 단순 계층형 (Router → Service → Repository) - FastAPI에 가장 자연스러운 구조
B) 클린 아키텍처 / 헥사고날 (Port-Adapter 패턴) - 도메인 중심, 테스트 용이
C) 도메인 주도 설계 (DDD) - 도메인 모델 중심, 복잡한 비즈니스 로직에 적합
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
프론트엔드 상태 관리는 어떤 접근을 선호하나요?

A) React Context API + useReducer (라이브러리 최소화)
B) Zustand (경량 상태 관리)
C) Redux Toolkit (대규모 상태 관리, 보일러플레이트 많음)
D) TanStack Query (React Query) + 로컬 상태 (서버 상태 중심)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
고객용 앱과 관리자용 앱의 코드 공유 전략은 어떻게 할까요?

A) 모노레포 (하나의 저장소에 공유 패키지 + 2개 앱) - 코드 재사용 용이
B) 완전 분리 (독립 저장소 2개) - 독립적 배포, 코드 공유 없음
C) 단일 앱 + 라우팅 분리 (하나의 앱에서 역할별 라우팅) - 가장 단순
D) Other (please describe after [Answer]: tag below)

[Answer]: 
