# 빌드 지침

## 사전 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 20+ | 프론트엔드 빌드, 모노레포 |
| Python | 3.12+ | 백엔드 |
| uv | latest | Python 패키지 관리 |
| Docker | 24+ | 컨테이너 빌드, 로컬 DB |
| docker-compose | 2.20+ | 로컬 개발 환경 |
| PostgreSQL | 16 | DB (docker로 실행) |

## 환경변수

```bash
# backend (.env)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/table_order
SECRET_KEY=your-secret-key-min-32-chars-long
JWT_EXPIRY_HOURS=16
AWS_S3_BUCKET=table-order-menu-images-dev
AWS_REGION=ap-northeast-2
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174"]
LOG_LEVEL=INFO
```

## 빌드 순서

### 1. 인프라 시작 (PostgreSQL + LocalStack)
```bash
cd aidlc-table-order
docker-compose up -d db localstack
```

### 2. 백엔드 빌드
```bash
cd backend
uv sync                          # 의존성 설치
cp .env.example .env             # 환경변수 설정 (필요시 수정)
uv run alembic upgrade head      # DB 마이그레이션
uv run python scripts/seed.py    # 시드 데이터 (선택)
uv run uvicorn app.main:app --reload --port 8000  # 서버 시작
```

### 3. 프론트엔드 빌드
```bash
cd aidlc-table-order
npm install                      # 모노레포 전체 의존성 설치

# shared 패키지 타입 체크
npm -w packages/shared run type-check

# customer-web 빌드
npm -w apps/customer run build

# admin-web 빌드
npm -w apps/admin run build
```

### 4. 프론트엔드 개발 서버 (MSW mock 모드)
```bash
# 고객용 (포트 5173)
npm -w apps/customer run dev

# 관리자용 (포트 5174)
npm -w apps/admin run dev
```

### 5. 빌드 검증
- 백엔드: `http://localhost:8000/docs` (Swagger UI)
- 고객앱: `http://localhost:5173`
- 관리자앱: `http://localhost:5174`

## Docker 빌드 (프로덕션)
```bash
cd backend
docker build -t table-order-api .
docker run -p 8000:8000 --env-file .env table-order-api
```

## 트러블슈팅

### DB 연결 실패
- `docker-compose ps`로 PostgreSQL 상태 확인
- `docker-compose logs db`로 로그 확인
- DATABASE_URL이 올바른지 확인

### npm install 실패
- Node.js 20+ 확인
- `rm -rf node_modules && npm install` 재시도
- npm workspace 구조 확인 (`package.json`의 `workspaces`)
