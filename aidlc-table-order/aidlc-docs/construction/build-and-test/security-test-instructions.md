# 보안 테스트 지침

## Security Baseline 검증 체크리스트

### SECURITY-01: 암호화
- [ ] PostgreSQL TLS 연결 강제 확인 (`sslmode=require`)
- [ ] S3 서버 측 암호화 확인 (AES-256)

### SECURITY-03: 애플리케이션 로깅
- [ ] structlog JSON 포맷 출력 확인
- [ ] 로그에 비밀번호/토큰/PII 미포함 확인
- [ ] request_id 자동 생성 확인

### SECURITY-04: HTTP 보안 헤더
```bash
curl -I http://localhost:8000/health
# 확인 항목:
# Content-Security-Policy: default-src 'self'
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: strict-origin-when-cross-origin
```

### SECURITY-05: 입력 검증
- [ ] 잘못된 타입 전송 시 422 반환 확인
- [ ] 문자열 최대 길이 초과 시 422 확인
- [ ] SQL 인젝션 시도 시 안전한 처리 확인 (SQLAlchemy 파라미터화)
```bash
# SQL 인젝션 테스트
curl -X POST http://localhost:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"store_id":"test","username":"admin'\'' OR 1=1--","password":"test"}'
# 기대: 401 또는 422 (SQL 실행 안 됨)
```

### SECURITY-08: 접근 제어
- [ ] 토큰 없이 인증 엔드포인트 접근 시 401 확인
- [ ] table 역할로 admin 엔드포인트 접근 시 403 확인
- [ ] 다른 매장 데이터 접근 시 403 확인 (IDOR 방지)
- [ ] CORS 허용되지 않은 origin에서 요청 시 차단 확인

### SECURITY-10: 의존성 보안
```bash
# Python 의존성 취약점 스캔
cd backend
uv run pip-audit

# Node.js 의존성 취약점 스캔
cd aidlc-table-order
npm audit
```

### SECURITY-11: Rate Limiting
```bash
# 로그인 Rate Limit 테스트 (10회/분 초과)
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"store_id":"store-001","username":"admin","password":"wrong"}'
done
# 기대: 11번째부터 429 반환
```

### SECURITY-12: 인증/자격 증명
- [ ] bcrypt 해싱 확인 (DB에서 password_hash 확인)
- [ ] 5회 로그인 실패 시 15분 잠금 확인
- [ ] JWT 만료 후 401 반환 확인
- [ ] 소스 코드에 하드코딩된 비밀번호 없음 확인
```bash
grep -r "password" backend/app/ backend/cores/ --include="*.py" | grep -v "password_hash" | grep -v "test"
```

### SECURITY-15: 에러 핸들링
- [ ] 500 에러 시 스택 트레이스 미노출 확인
- [ ] 제네릭 에러 메시지 반환 확인
```bash
# 의도적 에러 유발 후 응답 확인
curl http://localhost:8000/api/stores/invalid-uuid
# 기대: {"detail":"..."} (스택 트레이스 없음)
```
