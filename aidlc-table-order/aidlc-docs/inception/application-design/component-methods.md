# 컴포넌트 메서드 정의

> 비즈니스 로직 상세는 Functional Design 단계에서 정의합니다.
> 여기서는 메서드 시그니처와 고수준 목적만 정의합니다.

---

## C1: Auth

### Router: /api/auth
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| POST | /admin/login | 관리자 로그인 | store_id, username, password | JWT 토큰 |
| POST | /table/setup | 테이블 초기 설정 | store_id, table_number, password | JWT 토큰 |
| POST | /table/auto-login | 테이블 자동 로그인 | store_id, table_number, password | JWT 토큰 |
| POST | /token/refresh | 토큰 갱신 | refresh_token | 새 JWT 토큰 |

### Service: AuthService
| 메서드 | 목적 | 비고 |
|--------|------|------|
| authenticate_admin(store_id, username, password) | 관리자 인증 | bcrypt 검증, 시도 제한 |
| authenticate_table(store_id, table_number, password) | 테이블 인증 | 자동 로그인용 |
| create_token(subject, role, expires) | JWT 생성 | 16시간 만료 |
| verify_token(token) | JWT 검증 | 서명, 만료, 역할 확인 |

### Repository: AdminRepository, TableAuthRepository
| 메서드 | 목적 |
|--------|------|
| get_admin_by_credentials(store_id, username) | 관리자 조회 |
| get_table_auth(store_id, table_number) | 테이블 인증정보 조회 |
| increment_login_attempts(store_id, username) | 로그인 시도 횟수 증가 |
| reset_login_attempts(store_id, username) | 로그인 시도 횟수 초기화 |

---

## C2: Store

### Router: /api/stores
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| GET | /{store_id} | 매장 정보 조회 | store_id | 매장 정보 |

### Service: StoreService
| 메서드 | 목적 |
|--------|------|
| get_store(store_id) | 매장 정보 조회 |

### Repository: StoreRepository
| 메서드 | 목적 |
|--------|------|
| find_by_id(store_id) | ID로 매장 조회 |

---

## C3: Table

### Router: /api/tables
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| GET | / | 매장 테이블 목록 | store_id (from token) | 테이블 목록 |
| POST | /{table_id}/complete | 이용 완료 | table_id | 성공/실패 |
| GET | /{table_id}/history | 과거 주문 내역 | table_id, date_from, date_to | 과거 주문 목록 |

### Service: TableService
| 메서드 | 목적 | 비고 |
|--------|------|------|
| get_tables(store_id) | 매장 테이블 목록 조회 | |
| complete_table_session(table_id) | 이용 완료 처리 | 주문 → 이력 이동, 리셋 |
| get_order_history(table_id, date_from, date_to) | 과거 주문 내역 조회 | 날짜 필터링 |

### Repository: TableRepository, TableSessionRepository
| 메서드 | 목적 |
|--------|------|
| find_tables_by_store(store_id) | 매장별 테이블 목록 |
| get_current_session(table_id) | 현재 세션 조회 |
| close_session(session_id) | 세션 종료 |
| create_session(table_id) | 새 세션 생성 |

---

## C4: Menu

### Router: /api/menus
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| GET | / | 메뉴 목록 조회 | store_id, category_id? | 카테고리별 메뉴 목록 |
| GET | /{menu_id} | 메뉴 상세 (옵션 포함) | menu_id | 메뉴 상세 + 옵션 그룹 |
| POST | / | 메뉴 등록 | 메뉴 정보 | 생성된 메뉴 |
| PUT | /{menu_id} | 메뉴 수정 | menu_id, 수정 정보 | 수정된 메뉴 |
| DELETE | /{menu_id} | 메뉴 삭제 | menu_id | 성공/실패 |
| PUT | /order | 메뉴 순서 변경 | menu_id 목록 (순서) | 성공/실패 |
| GET | /categories | 카테고리 목록 | store_id | 카테고리 목록 |

### Router: /api/option-groups
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| GET | / | 옵션 그룹 목록 | store_id | 옵션 그룹 목록 |
| POST | / | 옵션 그룹 생성 | 그룹 정보 + 항목 | 생성된 그룹 |
| PUT | /{group_id} | 옵션 그룹 수정 | group_id, 수정 정보 | 수정된 그룹 |
| DELETE | /{group_id} | 옵션 그룹 삭제 | group_id | 성공/실패 |
| POST | /{group_id}/menus/{menu_id} | 메뉴-옵션 연결 | group_id, menu_id | 성공/실패 |
| DELETE | /{group_id}/menus/{menu_id} | 메뉴-옵션 해제 | group_id, menu_id | 성공/실패 |

### Service: MenuService
| 메서드 | 목적 |
|--------|------|
| get_menus_by_store(store_id, category_id?) | 카테고리별 메뉴 조회 (인기 메뉴 우선) |
| get_menu_detail(menu_id) | 메뉴 상세 + 옵션 그룹 조회 |
| create_menu(menu_data) | 메뉴 등록 |
| update_menu(menu_id, menu_data) | 메뉴 수정 |
| delete_menu(menu_id) | 메뉴 삭제 |
| reorder_menus(menu_ids) | 메뉴 순서 변경 |
| create_option_group(group_data) | 옵션 그룹 생성 |
| update_option_group(group_id, group_data) | 옵션 그룹 수정 |
| delete_option_group(group_id) | 옵션 그룹 삭제 |
| link_option_to_menu(group_id, menu_id) | 메뉴-옵션 연결 |
| unlink_option_from_menu(group_id, menu_id) | 메뉴-옵션 해제 |

---

## C5: Order

### Router: /api/orders
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| POST | / | 주문 생성 | 주문 정보 (메뉴+옵션+수량) | 주문번호, 회차 |
| GET | / | 현재 세션 주문 목록 | table_id, session_id | 주문 목록 + total |
| PATCH | /{order_id}/status | 주문 상태 변경 | order_id, status | 성공/실패 |
| DELETE | /{order_id} | 주문 삭제 (관리자) | order_id | 성공/실패 |
| GET | /polling | 폴링 데이터 | store_id, since? | 테이블별 주문 현황 |
| GET | /receipt | 영수증 조회 | table_id, session_id | 회차별 영수증 |

### Service: OrderService
| 메서드 | 목적 | 비고 |
|--------|------|------|
| create_order(order_data) | 주문 생성 | 회차 자동 계산, 세션 없으면 새 세션 시작 |
| get_session_orders(table_id, session_id) | 세션 주문 목록 | total 금액 포함 |
| update_order_status(order_id, status) | 상태 변경 | 대기중→준비중→완료 |
| delete_order(order_id) | 주문 삭제 | 총 금액 재계산 |
| get_polling_data(store_id, since?) | 폴링 데이터 | 테이블별 최신 주문 현황 |
| get_receipt(table_id, session_id) | 영수증 | 회차별 그룹핑 |
| archive_orders(session_id) | 주문 이력 아카이빙 | 이용 완료 시 호출 |

---

## C6: Recommendation

### Router: /api/recommendations
| 메서드 | 엔드포인트 | 목적 | 입력 | 출력 |
|--------|-----------|------|------|------|
| POST | / | 추천 메뉴 조회 | menu_ids (장바구니), store_id | 추천 메뉴 목록 |

### Service: RecommendationService
| 메서드 | 목적 | 비고 |
|--------|------|------|
| get_recommendations(menu_ids, store_id) | 추천 메뉴 생성 | 히스토리 기반, 없으면 랜덤 |
