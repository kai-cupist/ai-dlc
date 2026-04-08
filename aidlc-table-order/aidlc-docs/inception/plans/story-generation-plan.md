# 스토리 생성 계획

## 실행 계획

### Phase 1: 페르소나 생성
- [x] 고객 페르소나 정의 (매장 방문 고객) - P1 민지, P2 준호, P3 수진
- [x] 관리자 페르소나 정의 (매장 운영자) - P4 영호
- [x] 페르소나별 목표, 특성, 기술 수준 정리
- [x] personas.md 파일 생성

### Phase 2: 사용자 스토리 생성
- [x] 고객 스토리: 테이블 세션 및 인증 (FR-01) - US-01, US-02
- [x] 고객 스토리: 메뉴 조회 및 탐색 (FR-02) - US-03 ~ US-06
- [x] 고객 스토리: 장바구니 관리 (FR-03) - US-07 ~ US-09
- [x] 고객 스토리: 메뉴 추천 (FR-04) - US-10
- [x] 고객 스토리: 주문 생성 (FR-05) - US-11, US-12
- [x] 고객 스토리: 주문 대기 및 진행 상황 (FR-06) - US-13, US-14
- [x] 고객 스토리: 주문 내역 조회 (FR-07) - US-15
- [x] 관리자 스토리: 매장 인증 (FR-08) - US-16
- [x] 관리자 스토리: 실시간 주문 모니터링 (FR-09) - US-17, US-18
- [x] 관리자 스토리: 테이블 관리 (FR-10) - US-19 ~ US-21
- [x] 관리자 스토리: 메뉴 및 옵션 관리 (FR-11) - US-22, US-23
- [x] 에러/예외 시나리오 스토리 - US-24 ~ US-26
- [x] stories.md 파일 생성

### Phase 3: 검증
- [x] INVEST 기준 검증 (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] 페르소나-스토리 매핑 확인
- [x] 인수 기준 완전성 확인

---

## 명확화 질문

아래 질문에 답변하여 스토리 생성 방향을 결정해 주세요.

## Question 1
스토리 분류 방식은 어떤 것을 선호하나요?

A) 사용자 여정 기반 - 고객의 주문 플로우 순서대로 구성
B) 기능 기반 - 시스템 기능별로 구성 (메뉴, 장바구니, 주문 등)
C) 페르소나 기반 - 고객 스토리 / 관리자 스토리로 크게 분리
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
스토리의 세분화 수준은 어느 정도를 원하나요?

A) 큰 단위 (에픽 수준) - 기능 영역당 1~2개 스토리 (총 10~15개)
B) 중간 단위 - 주요 사용자 액션당 1개 스토리 (총 20~30개)
C) 작은 단위 - 개별 인터랙션당 1개 스토리 (총 40개 이상)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
인수 기준(Acceptance Criteria) 형식은 어떤 것을 선호하나요?

A) Given-When-Then 형식 (BDD 스타일)
B) 체크리스트 형식 (간결한 조건 목록)
C) 시나리오 서술 형식 (자유 형식 설명)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
고객 페르소나를 몇 가지로 구분할까요?

A) 1가지 - 일반 매장 방문 고객 (통합)
B) 2가지 - 디지털 익숙한 고객 / 디지털 서툰 고객 (연령대별)
C) 3가지 - 혼밥 고객 / 일반 그룹 / 대규모 모임으로 세분화
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
에러/예외 시나리오 스토리도 포함할까요?

A) 포함 - 네트워크 오류, 세션 만료, 재고 소진 등 예외 케이스 스토리 추가
B) 제외 - 정상 플로우 스토리만 작성, 예외 처리는 인수 기준에 포함
C) Other (please describe after [Answer]: tag below)

[Answer]: A
