# 배포 아키텍처 - backend-api

## 로컬 개발 환경

### docker-compose.yml 구성

| 서비스 | 이미지 | 포트 | 용도 |
|--------|--------|------|------|
| **api** | 로컬 빌드 | 8000 | FastAPI 서버 (핫 리로드) |
| **db** | postgres:16-alpine | 5432 | PostgreSQL |
| **localstack** | localstack/localstack | 4566 | S3 로컬 에뮬레이션 |

### 로컬 개발 흐름
```
1. docker-compose up -d db localstack    # DB + S3 에뮬레이션 시작
2. alembic upgrade head                   # 마이그레이션 실행
3. uvicorn app.main:app --reload          # API 서버 시작 (핫 리로드)
```

---

## 프로덕션 배포

### Dockerfile (멀티 스테이지)
```
Stage 1: Builder
  - python:3.12-slim 기반
  - poetry install (프로덕션 의존성만)

Stage 2: Runtime
  - python:3.12-slim 기반
  - Builder에서 가상환경 복사
  - non-root 사용자 실행
  - uvicorn 실행 (workers=2)
  - EXPOSE 8000
```

### ECS Fargate 태스크 정의

| 항목 | 값 |
|------|-----|
| CPU | 512 (0.5 vCPU) |
| Memory | 1024 MB |
| 포트 | 8000 |
| 헬스체크 | GET /health (interval 30s, timeout 5s) |
| 로그 드라이버 | awslogs → CloudWatch |
| 환경변수 | Secrets Manager에서 주입 |
| 태스크 수 | 1 (MVP), 오토스케일링 가능 |

### ALB 설정

| 항목 | 값 |
|------|-----|
| 리스너 | HTTPS:443 → 타겟 그룹 |
| HTTP:80 | HTTPS로 리다이렉트 |
| 타겟 그룹 | ECS Fargate:8000 |
| 헬스체크 경로 | /health |
| 헬스체크 간격 | 30초 |
| Healthy threshold | 2 |
| Unhealthy threshold | 3 |
| 스티키 세션 | 비활성화 (JWT 기반이므로 불필요) |

### RDS 설정

| 항목 | 값 |
|------|-----|
| 엔진 | PostgreSQL 16 |
| 인스턴스 | db.t3.micro (MVP) |
| 스토리지 | 20 GB gp3 |
| 다중 AZ | 비활성화 (MVP) |
| 백업 | 자동 7일 보관 |
| 암호화 | 활성화 (AWS 관리형 키) |
| TLS | 강제 (rds.force_ssl=1) |
| 파라미터 | shared_buffers, max_connections 튜닝 |

---

## CI/CD 파이프라인 (향후)

```
Push to main
    |
    v
린트 + 타입 체크 (ruff, mypy)
    |
    v
단위 테스트 (pytest)
    |
    v
Docker 이미지 빌드
    |
    v
ECR 푸시
    |
    v
ECS 서비스 업데이트 (롤링 배포)
    |
    v
헬스 체크 확인
```

---

## 환경 분리

| 환경 | 용도 | 인프라 |
|------|------|--------|
| **local** | 개발 | docker-compose (DB + LocalStack) |
| **prod** | 프로덕션 | ECS Fargate + RDS + S3 (Terraform) |

> MVP 단계에서는 staging 환경 생략. 필요 시 Terraform workspace로 추가.
