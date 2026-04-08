# 빌드 및 테스트 요약

## 빌드 상태

| 유닛 | 빌드 도구 | 상태 |
|------|-----------|------|
| shared | TypeScript (tsc) | 실행 대기 |
| backend-api | uv + FastAPI | 실행 대기 |
| customer-web | Vite + React | 실행 대기 |
| admin-web | Vite + React + Tailwind | 실행 대기 |

## 테스트 실행 요약

### 단위 테스트
| 유닛 | 도구 | 테스트 수 | 커버리지 목표 | 상태 |
|------|------|----------|-------------|------|
| backend-api | pytest | 51 | 80%+ | PR #5에서 전체 통과 확인 |
| customer-web | Vitest | 6 파일 | - | PR #3에서 생성 |
| admin-web | - | - | - | - |

### 통합 테스트
| 시나리오 | 대상 | 상태 |
|----------|------|------|
| 고객 주문 플로우 | customer ↔ backend | 실행 대기 |
| 관리자 모니터링 | admin ↔ backend | 실행 대기 |
| 관리자 메뉴 관리 | admin ↔ backend | 실행 대기 |
| 크로스 앱 연동 | customer + admin ↔ backend | 실행 대기 |

### E2E 테스트
| 시나리오 | 설명 | 상태 |
|----------|------|------|
| E2E-01 | 고객 주문 전체 플로우 | 실행 대기 |
| E2E-02 | 추가 주문 (n회차) | 실행 대기 |
| E2E-03 | 관리자 주문 관리 | 실행 대기 |
| E2E-04 | 테이블 이용 완료 | 실행 대기 |
| E2E-05 | 메뉴/옵션 관리 | 실행 대기 |
| E2E-06 | 에러 처리 | 실행 대기 |

### 성능 테스트
| 항목 | 목표 | 상태 |
|------|------|------|
| 폴링 응답 시간 | p95 < 100ms | 실행 대기 |
| API 응답 시간 | p95 < 200ms | 실행 대기 |
| 동시 접속 | 50+ 테이블 | 실행 대기 |

### 보안 테스트
| 규칙 | 검증 항목 | 상태 |
|------|----------|------|
| SECURITY-01 | TLS, 암호화 | 실행 대기 |
| SECURITY-03 | 구조화 로깅, PII 미포함 | 실행 대기 |
| SECURITY-04 | HTTP 보안 헤더 5개 | 실행 대기 |
| SECURITY-05 | 입력 검증, SQL 인젝션 | 실행 대기 |
| SECURITY-08 | JWT, CORS, IDOR | 실행 대기 |
| SECURITY-10 | 의존성 취약점 스캔 | 실행 대기 |
| SECURITY-11 | Rate Limiting | 실행 대기 |
| SECURITY-12 | bcrypt, 잠금, 토큰 | 실행 대기 |
| SECURITY-15 | 에러 핸들링, 스택 미노출 | 실행 대기 |

## 생성된 테스트 문서

| 문서 | 설명 |
|------|------|
| build-instructions.md | 전체 빌드 순서 및 환경 설정 |
| unit-test-instructions.md | 백엔드 pytest + 프론트엔드 Vitest |
| integration-test-instructions.md | 4개 통합 테스트 시나리오 |
| e2e-test-instructions.md | 6개 E2E 시나리오 (Playwright) |
| performance-test-instructions.md | k6 부하 테스트 (폴링, 주문) |
| security-test-instructions.md | Security Baseline 9개 규칙 검증 |

## 전체 상태
- **빌드**: 문서 준비 완료, 실행 대기
- **테스트**: 문서 준비 완료, 실행 대기
- **Operations 준비**: Build and Test 완료 후 진행
