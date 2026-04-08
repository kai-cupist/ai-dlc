# NFR 요구사항 - backend-api

## NFR-PERF: 성능

| 항목 | 목표 |
|------|------|
| API 응답 시간 (일반) | 95th percentile < 200ms |
| API 응답 시간 (폴링) | 95th percentile < 100ms |
| 폴링 간격 | 2초 |
| 동시 접속 | 매장당 50+ 테이블 동시 접속 지원 |
| DB 커넥션 풀 | 최소 10, 최대 50 커넥션 |
| 추천 계산 | < 500ms (히스토리 검색 포함) |
| 인기 메뉴 계산 | 캐싱 적용, TTL 5분 |

## NFR-SEC: 보안 (Security Baseline)

| 규칙 | backend-api 적용 |
|------|-----------------|
| SECURITY-01 | PostgreSQL TLS 연결 강제, S3 서버 측 암호화 |
| SECURITY-03 | structlog 기반 구조화 로깅 (JSON), PII/토큰 마스킹 |
| SECURITY-04 | FastAPI 미들웨어로 보안 헤더 설정 |
| SECURITY-05 | Pydantic DTO로 전 엔드포인트 입력 검증, 파라미터화 쿼리 (SQLAlchemy) |
| SECURITY-08 | JWT 미들웨어 매 요청 검증, CORS 허용 origin 제한, IDOR 방지 (store_id 검증) |
| SECURITY-09 | 프로덕션 에러 응답에 스택 트레이스 미포함, 기본 자격 증명 없음 |
| SECURITY-10 | uv.lock 커밋, 의존성 스캔 (safety/pip-audit) |
| SECURITY-11 | slowapi RateLimiter (복합 키: IP+파라미터/JWT subject) |
| SECURITY-12 | bcrypt 해싱, 5회 실패 시 15분 잠금, HttpOnly/Secure/SameSite 쿠키 |
| SECURITY-13 | 안전한 역직렬화 (Pydantic), CDN SRI |
| SECURITY-15 | 글로벌 에러 핸들러, fail-closed, 리소스 정리 (async context manager) |

## NFR-AVAIL: 가용성

| 항목 | 목표 |
|------|------|
| 가용성 목표 | 99.5% (매장 영업 시간 기준) |
| 헬스 체크 | GET /health 엔드포인트 (DB 연결 확인 포함) |
| 그레이스풀 셧다운 | SIGTERM 수신 시 진행 중 요청 완료 후 종료 |
| DB 장애 대응 | 커넥션 풀 재연결 로직, 에러 시 적절한 503 응답 |

## NFR-RELY: 신뢰성

| 항목 | 목표 |
|------|------|
| 트랜잭션 | 주문 생성/삭제/아카이빙은 단일 트랜잭션 내 처리 |
| 데이터 정합성 | 금액 계산은 서버 측에서만, FK 제약조건 활용 |
| 멱등성 | 주문 생성 시 중복 방지 (클라이언트 요청 ID 활용) |
| 에러 복구 | 실패한 트랜잭션 자동 롤백 |

## NFR-MAINT: 유지보수성

| 항목 | 목표 |
|------|------|
| 코드 구조 | 계층형 (Router → Service → Repository) + TDD |
| 테스트 커버리지 | 비즈니스 로직 80% 이상 |
| API 문서 | FastAPI 자동 생성 (Swagger/OpenAPI) |
| DB 마이그레이션 | Alembic 자동 마이그레이션 |
| 타입 안전 | Pydantic DTO + Python type hints |
