# 요구사항 명확화 - 모순/모호 사항 해결

기존 답변에서 4건의 모순 및 모호한 점이 발견되었습니다.
각 질문의 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.

---

## 모호 1: 프론트엔드 프레임워크 (Q2)
"React"로 답변하셨는데 구체적으로 어떤 구성인지 확인이 필요합니다.

### Clarification Question 1
프론트엔드를 어떤 방식으로 구성할 예정인가요?

A) React + Vite (SPA, 별도 백엔드 API 서버와 분리)
B) Next.js (React 기반, SSR/SSG 지원, 풀스택 가능)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 모순 2: 데이터베이스 vs 매장 규모 (Q3 vs Q5)
Q3에서 **SQLite**를 선택하셨고 Q5에서 **대규모(다중 매장, 50+ 테이블)**를 선택하셨습니다.
SQLite는 단일 파일 DB로 동시 쓰기가 제한되어 다중 매장 대규모 서비스에는 부적합합니다.

### Clarification Question 2
어떻게 조정할까요?

A) DB를 PostgreSQL로 변경 (대규모 서비스에 적합)
B) DB를 MySQL로 변경 (대규모 서비스에 적합)
C) 규모를 축소 — MVP는 단일 매장 소규모로 시작, SQLite 유지
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 모순 3: API 설계 vs 실시간 요구사항 (Q6 vs 요구사항 문서)
Q6에서 **REST API만** 선택하셨지만, 요구사항 문서(3.2.2)에는 **SSE(Server-Sent Events) 기반 실시간 주문 모니터링**이 명시되어 있습니다.
REST API만으로는 실시간 주문 알림을 구현할 수 없습니다.

### Clarification Question 3
실시간 통신 방식을 어떻게 할까요?

A) REST API + SSE (요구사항 문서대로, 관리자 주문 모니터링용)
B) REST API + WebSocket (SSE 대신 양방향 통신)
C) REST API + 폴링 (일정 간격으로 서버에 조회, 실시간성 낮음)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 무효 4: 보안 확장 규칙 (Q10)
보안 확장 규칙은 코드 생성 시 자동으로 적용되는 보안 규칙입니다.
예: 비밀번호 bcrypt 해싱, SQL 인젝션 방지, 입력값 검증, JWT 보안 등.

### Clarification Question 4
보안 확장 규칙을 적용할까요?

A) 예 — 보안 규칙 적용 (프로덕션 수준 보안, 권장)
B) 아니오 — 보안 규칙 건너뛰기 (빠른 프로토타입용)
C) Other (please describe after [Answer]: tag below)

[Answer]: A
