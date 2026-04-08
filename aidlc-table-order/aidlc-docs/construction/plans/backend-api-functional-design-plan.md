# backend-api Functional Design 계획

## 실행 계획

### Phase 1: 도메인 엔티티
- [x] Store (매장) 엔티티 정의
- [x] Admin (관리자) 엔티티 정의
- [x] Table (테이블) 엔티티 정의
- [x] TableSession (테이블 세션) 엔티티 정의
- [x] Category (카테고리) 엔티티 정의
- [x] Menu (메뉴) 엔티티 정의
- [x] OptionGroup (옵션 그룹) 엔티티 정의
- [x] OptionItem (옵션 항목) 엔티티 정의
- [x] MenuOptionGroup (메뉴-옵션 연결) 엔티티 정의
- [x] Order (주문) 엔티티 정의
- [x] OrderItem (주문 항목) 엔티티 정의
- [x] OrderItemOption (주문 항목 옵션) 엔티티 정의
- [x] OrderHistory (주문 이력) 엔티티 정의
- [x] 엔티티 관계 다이어그램
- [x] domain-entities.md 생성

### Phase 2: 비즈니스 로직 모델
- [x] 인증 플로우 (관리자 로그인, 테이블 자동 로그인)
- [x] 주문 생성 플로우 (세션 확인, 회차 계산, 금액 계산)
- [x] 주문 상태 전이 (대기중 → 준비중 → 완료)
- [x] 테이블 세션 라이프사이클 (시작 → 이용 완료 → 아카이빙)
- [x] 추천 로직 (히스토리 기반 + 랜덤 폴백)
- [x] 인기 메뉴 판별 로직
- [x] 예상 대기 시간 계산 로직
- [x] business-logic-model.md 생성

### Phase 3: 비즈니스 규칙
- [x] 인증 규칙 (비밀번호 정책, 시도 제한, 세션 만료)
- [x] 메뉴/옵션 검증 규칙 (필수 필드, 가격 범위, 옵션 필수/선택)
- [x] 주문 검증 규칙 (메뉴 존재 확인, 옵션 유효성, 금액 검증)
- [x] 세션 규칙 (세션 종료 조건, 이력 보관)
- [x] business-rules.md 생성

---

## 명확화 질문

## Question 1
인기 메뉴 판별 기준은 어떻게 할까요?

A) 주문 횟수 기준 - 최근 30일간 주문 횟수 상위 N개
B) 주문 비율 기준 - 전체 주문 중 해당 메뉴 비율 상위 N%
C) 관리자 수동 지정 - 관리자가 직접 인기 메뉴 태그 설정
D) Other (please describe after [Answer]: tag below)

[Answer]: A가 기본인데, C도 가능

## Question 2
예상 대기 시간 계산 방식은 어떻게 할까요?

A) 고정값 - 메뉴당 고정 준비 시간 설정 (예: 메뉴별 5분, 10분 등)
B) 평균 기반 - 과거 동일 메뉴의 평균 준비 시간 계산
C) 관리자 설정 - 매장 단위로 기본 준비 시간 설정 (예: 주문당 15분)
D) Other (please describe after [Answer]: tag below)

[Answer]: B기본, C가능

## Question 3
주문 이력(OrderHistory) 보관 기간은 어떻게 할까요?

A) 무제한 보관 (삭제하지 않음)
B) 90일 보관 후 자동 삭제
C) 1년 보관 후 자동 삭제
D) Other (please describe after [Answer]: tag below)

[Answer]: A
