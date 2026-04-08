# 서비스 정의 및 오케스트레이션

## 서비스 레이어 개요

서비스 레이어는 비즈니스 로직을 조율하고, 여러 리포지토리를 조합하여 복잡한 트랜잭션을 처리합니다.

---

## S1: AuthService
| 항목 | 내용 |
|------|------|
| **책임** | 관리자/테이블 인증, JWT 발급/검증, 브루트포스 방어 |
| **의존** | AdminRepository, TableAuthRepository |
| **호출자** | Auth Router |

**주요 오케스트레이션**:
- 관리자 로그인: 시도 제한 확인 → 자격 증명 검증 → JWT 발급 → 시도 횟수 리셋
- 테이블 자동 로그인: 자격 증명 검증 → JWT 발급

---

## S2: StoreService
| 항목 | 내용 |
|------|------|
| **책임** | 매장 정보 조회 |
| **의존** | StoreRepository |
| **호출자** | Store Router |

---

## S3: TableService
| 항목 | 내용 |
|------|------|
| **책임** | 테이블 관리, 세션 라이프사이클 |
| **의존** | TableRepository, TableSessionRepository, OrderService |
| **호출자** | Table Router |

**주요 오케스트레이션**:
- 이용 완료: 현재 세션 조회 → OrderService.archive_orders 호출 → 세션 종료 → 테이블 리셋

---

## S4: MenuService
| 항목 | 내용 |
|------|------|
| **책임** | 메뉴/카테고리/옵션 CRUD, 메뉴-옵션 연결 |
| **의존** | MenuRepository, CategoryRepository, OptionGroupRepository |
| **호출자** | Menu Router, OptionGroup Router |

**주요 오케스트레이션**:
- 메뉴 조회: 카테고리별 그룹핑 → 인기 메뉴 우선 정렬 → 옵션 그룹 로드
- 메뉴 삭제: 연결된 옵션 그룹 해제 → 메뉴 삭제

---

## S5: OrderService
| 항목 | 내용 |
|------|------|
| **책임** | 주문 CRUD, 상태 관리, 이력 아카이빙, 폴링 데이터 |
| **의존** | OrderRepository, OrderHistoryRepository, TableSessionRepository, MenuRepository |
| **호출자** | Order Router, TableService (이용 완료 시) |

**주요 오케스트레이션**:
- 주문 생성: 세션 확인(없으면 시작) → 회차 계산 → 메뉴/옵션 검증 → 금액 계산 → 주문 저장
- 주문 삭제: 주문 삭제 → 테이블 총 금액 재계산
- 이용 완료 아카이빙: 세션 주문 조회 → OrderHistory로 복사 → 원본 삭제

---

## S6: RecommendationService
| 항목 | 내용 |
|------|------|
| **책임** | 주문 히스토리 기반 메뉴 추천 |
| **의존** | OrderHistoryRepository, MenuRepository |
| **호출자** | Recommendation Router |

**주요 오케스트레이션**:
- 추천 생성: 장바구니 메뉴로 히스토리 검색 → 공통 메뉴 외 다른 메뉴 추출 → 빈도순 정렬 → 없으면 랜덤 추천

---

## 공통 미들웨어/의존성

| 컴포넌트 | 목적 |
|----------|------|
| **JWTMiddleware** | 모든 인증 필요 엔드포인트에서 토큰 검증 |
| **RateLimiter** | 공개 엔드포인트 Rate Limiting (SECURITY-11) |
| **RequestValidator** | 입력 검증 (Pydantic 스키마, SECURITY-05) |
| **ErrorHandler** | 글로벌 에러 핸들러 (SECURITY-15) |
| **StructuredLogger** | 구조화된 로깅 (SECURITY-03) |
| **SecurityHeaders** | HTTP 보안 헤더 (SECURITY-04) |
| **CORSMiddleware** | CORS 정책 (SECURITY-08) |
