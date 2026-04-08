# 단위 테스트 실행 지침

## 백엔드 단위 테스트 (pytest)

### 실행
```bash
cd backend
uv run pytest tests/ -v
```

### 기대 결과
- **테스트 수**: 51개
- **통과**: 51개, 실패 0개
- **커버리지 목표**: 비즈니스 로직 80%+

### 커버리지 측정
```bash
uv run pytest tests/ --cov=app --cov=cores --cov-report=html
# 결과: htmlcov/index.html
```

### 테스트 파일 목록
| 파일 | 테스트 수 | 대상 |
|------|----------|------|
| test_auth.py | ~8 | 관리자/테이블 로그인, JWT, 브루트포스 |
| test_stores.py | ~3 | 매장 조회 |
| test_tables.py | ~7 | 테이블 목록, 이용 완료, 과거 내역 |
| test_menus.py | ~8 | 메뉴 CRUD, 카테고리, 인기 메뉴 |
| test_option_groups.py | ~6 | 옵션 그룹 CRUD, 메뉴 연결 |
| test_orders.py | ~12 | 주문 생성, 상태 전이, 삭제, 폴링, 영수증 |
| test_recommendations.py | ~7 | 히스토리 기반 추천, 랜덤 폴백 |

## 프론트엔드 단위 테스트 (Vitest)

### customer-web 테스트
```bash
npm -w apps/customer run test
```

### 기대 결과
- **테스트 수**: 6개 파일
- CartContext 테스트 (addItem, updateQuantity, removeItem, clearAll, localStorage)
- useMenus/useOrders 훅 테스트
- MenuCard/CartItem 컴포넌트 테스트
- CheckoutPage 통합 테스트

### 실패 시 대응
1. 테스트 출력에서 실패 원인 확인
2. MSW mock 핸들러와 API 타입 일치 여부 확인
3. shared 패키지 타입 변경 시 프론트 테스트 업데이트
