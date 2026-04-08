# 컴포넌트 의존성

## 의존성 매트릭스

| 컴포넌트 | 의존 대상 | 의존 유형 |
|----------|-----------|-----------|
| **AuthService** | AdminRepo, TableAuthRepo | 직접 |
| **StoreService** | StoreRepo | 직접 |
| **TableService** | TableRepo, TableSessionRepo, **OrderService** | 직접 + 서비스 간 |
| **MenuService** | MenuRepo, CategoryRepo, OptionGroupRepo | 직접 |
| **OrderService** | OrderRepo, OrderHistoryRepo, TableSessionRepo, MenuRepo | 직접 |
| **RecommendationService** | OrderHistoryRepo, MenuRepo | 직접 |

## 서비스 간 의존성

```
AuthService (독립)
    |
StoreService (독립)
    |
TableService ---------> OrderService (이용 완료 시 아카이빙)
    |                        |
MenuService (독립)    RecommendationService
                        (OrderHistory 읽기 전용)
```

**핵심 의존 관계**:
- `TableService → OrderService`: 이용 완료 시 주문 아카이빙 호출
- `RecommendationService → OrderHistoryRepository`: 추천 로직용 읽기 전용 접근
- 나머지 서비스는 독립적으로 동작

## 데이터 플로우

### 고객 주문 플로우
```
[고객 앱]
    |
    +-- GET /menus --> MenuService --> MenuRepo
    |                                    |
    +-- POST /recommendations --> RecommendationService --> OrderHistoryRepo
    |
    +-- POST /orders --> OrderService --> OrderRepo
    |                       |
    |                  TableSessionRepo (세션 확인/생성)
    |
    +-- GET /orders --> OrderService --> OrderRepo
    |
    +-- GET /orders/receipt --> OrderService --> OrderRepo
```

### 관리자 모니터링 플로우
```
[관리자 앱]
    |
    +-- POST /auth/admin/login --> AuthService --> AdminRepo
    |
    +-- GET /orders/polling --> OrderService --> OrderRepo
    |    (2초 간격)
    |
    +-- PATCH /orders/{id}/status --> OrderService --> OrderRepo
    |
    +-- POST /tables/{id}/complete --> TableService --> OrderService
    |                                                      |
    |                                                 archive_orders()
    |
    +-- CRUD /menus, /option-groups --> MenuService --> MenuRepo, OptionGroupRepo
```

## 프론트엔드 의존성

### 모노레포 패키지 의존성
```
apps/customer -----> packages/shared
                         |
apps/admin -------> packages/shared
```

### packages/shared 내부
| 모듈 | 목적 | 사용처 |
|------|------|--------|
| **api-client** | Axios 기반 API 호출 래퍼 | customer, admin |
| **types** | TypeScript 타입 (메뉴, 주문, 매장 등) | customer, admin |
| **hooks** | 공통 React 훅 (useAuth 등) | customer, admin |
| **utils** | 포맷팅, 검증 유틸리티 | customer, admin |

### apps/customer 상태 구조
| 상태 | 관리 방식 | 내용 |
|------|-----------|------|
| 메뉴 데이터 | TanStack Query | 서버 캐싱, 자동 갱신 |
| 주문 데이터 | TanStack Query | 서버 캐싱, 폴링 |
| 장바구니 | Context + useReducer + localStorage | 로컬 영속 |
| 인증 | Context | JWT 토큰, 테이블 정보 |

### apps/admin 상태 구조
| 상태 | 관리 방식 | 내용 |
|------|-----------|------|
| 주문 대시보드 | TanStack Query (2초 폴링) | 테이블별 주문 현황 |
| 메뉴 관리 | TanStack Query | CRUD 뮤테이션 |
| 인증 | Context | JWT 토큰, 매장 정보 |
