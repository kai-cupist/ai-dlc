# 기술 스택 결정 - backend-api

## 핵심 프레임워크

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **Python** | 3.12+ | 런타임 |
| **FastAPI** | 0.115+ | 웹 프레임워크 |
| **Uvicorn** | 0.34+ | ASGI 서버 |
| **Pydantic** | 2.x | DTO 검증 |

## 데이터베이스

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **PostgreSQL** | 16+ | RDBMS |
| **SQLAlchemy** | 2.x (async) | ORM |
| **asyncpg** | 0.30+ | 비동기 PostgreSQL 드라이버 |
| **Alembic** | 1.14+ | DB 마이그레이션 |

### DB 연결 설정
- **엔진**: `create_async_engine` (SQLAlchemy 2.x async)
- **세션**: `async_sessionmaker` + `AsyncSession`
- **커넥션 풀**: pool_size=10, max_overflow=40, pool_timeout=30
- **Dependency Injection**: FastAPI `Depends`로 세션 주입

## 인증/보안

| 패키지 | 용도 |
|--------|------|
| **python-jose[cryptography]** | JWT 생성/검증 |
| **passlib[bcrypt]** | 비밀번호 해싱 |
| **slowapi** | Rate Limiting |

## 로깅/모니터링

| 패키지 | 용도 |
|--------|------|
| **structlog** | 구조화된 JSON 로깅 |
| **python-json-logger** | JSON 포맷터 |

## 파일 저장

| 패키지 | 용도 |
|--------|------|
| **boto3** | AWS S3 이미지 업로드/조회 |
| **aioboto3** | 비동기 S3 클라이언트 |

## 테스트

| 패키지 | 용도 |
|--------|------|
| **pytest** | 테스트 프레임워크 |
| **pytest-asyncio** | 비동기 테스트 지원 |
| **httpx** | 비동기 테스트 클라이언트 (FastAPI TestClient 대체) |
| **factory-boy** | 테스트 데이터 팩토리 |
| **pytest-cov** | 커버리지 측정 |

## 개발 도구

| 패키지 | 용도 |
|--------|------|
| **poetry** | 패키지 관리 + 의존성 잠금 |
| **ruff** | 린팅 + 포맷팅 |
| **mypy** | 정적 타입 체크 |
| **pre-commit** | 커밋 전 자동 검사 |

## 인프라

| 도구 | 용도 |
|------|------|
| **Docker** | 컨테이너 이미지 |
| **docker-compose** | 로컬 개발 환경 (FastAPI + PostgreSQL + LocalStack S3) |
| **Terraform** | IaC (ECS Fargate, ALB, RDS, S3) |

## 설계 결정 근거

### 비동기 SQLAlchemy 선택 이유
- FastAPI의 async 엔드포인트와 자연스러운 통합
- 폴링 엔드포인트의 높은 동시성 처리 (매장당 50+ 테이블)
- asyncpg는 psycopg2 대비 동시 접속 처리에서 우수

### Alembic 선택 이유
- SQLAlchemy 공식 마이그레이션 도구
- 자동 마이그레이션 스크립트 생성
- 롤백 지원
- CI/CD 파이프라인에서 자동 실행 가능

### structlog 선택 이유
- SECURITY-03 준수 (구조화된 로깅)
- JSON 출력으로 로그 분석 용이
- 요청 ID, 사용자 정보 자동 바인딩
- PII 마스킹 프로세서 추가 가능

### slowapi 선택 이유
- SECURITY-11 준수 (Rate Limiting)
- FastAPI 네이티브 통합
- 복합 키 지원 (IP + 파라미터)
- 인메모리 → Redis 전환 용이
