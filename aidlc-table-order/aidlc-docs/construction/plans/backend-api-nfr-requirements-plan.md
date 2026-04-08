# backend-api NFR Requirements 계획

## 실행 계획

### Phase 1: NFR 요구사항 구체화
- [x] 성능 요구사항 상세화 (응답 시간, 동시 접속)
- [x] 보안 요구사항 상세화 (Security Baseline 적용 포인트)
- [x] 가용성/신뢰성 요구사항
- [x] nfr-requirements.md 생성

### Phase 2: 기술 스택 세부 결정
- [x] Python 패키지 선정 (ORM, 마이그레이션, 인증 등)
- [x] DB 연결/풀링 전략
- [x] 테스트 도구 선정
- [x] tech-stack-decisions.md 생성

---

## 명확화 질문

## Question 1
SQLAlchemy 사용 방식은 어떤 것을 선호하나요?

A) 동기 (SQLAlchemy + psycopg2) - 단순하고 디버깅 쉬움, 대부분의 경우 충분
B) 비동기 (SQLAlchemy + asyncpg) - FastAPI async와 자연스러운 통합, 높은 동시성
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
DB 마이그레이션 도구는 어떤 것을 사용할까요?

A) Alembic (SQLAlchemy 공식 마이그레이션, 가장 일반적)
B) 수동 SQL 마이그레이션 (직접 SQL 스크립트 관리)
C) Other (please describe after [Answer]: tag below)

[Answer]: A
