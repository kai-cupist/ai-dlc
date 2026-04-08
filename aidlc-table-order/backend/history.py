"""API interface version history for the Table Order backend-api.

This file documents all API endpoint changes across versions.
Import CHANGES to programmatically inspect the API evolution.
"""

CHANGES = [
    {
        "version": "0.1.0",
        "date": "2026-04-08",
        "description": "Initial API specification — all 28 endpoints defined",
        "endpoints": [
            # C1: Auth (4 endpoints)
            "POST   /api/auth/admin/login          — 관리자 로그인",
            "POST   /api/auth/table/setup           — 테이블 초기 설정",
            "POST   /api/auth/table/auto-login      — 테이블 자동 로그인",
            "POST   /api/auth/token/refresh         — 토큰 갱신",
            # C2: Store (1 endpoint)
            "GET    /api/stores/{store_id}           — 매장 정보 조회",
            # C3: Table (3 endpoints)
            "GET    /api/tables                      — 매장 테이블 목록",
            "POST   /api/tables/{table_id}/complete  — 이용 완료",
            "GET    /api/tables/{table_id}/history   — 과거 주문 내역",
            # C4: Menu (7 endpoints)
            "GET    /api/menus                       — 메뉴 목록 조회",
            "GET    /api/menus/{menu_id}             — 메뉴 상세 (옵션 포함)",
            "POST   /api/menus                       — 메뉴 등록",
            "PUT    /api/menus/{menu_id}             — 메뉴 수정",
            "DELETE /api/menus/{menu_id}             — 메뉴 삭제",
            "PUT    /api/menus/order                 — 메뉴 순서 변경",
            "GET    /api/menus/categories            — 카테고리 목록",
            # C4: OptionGroup (6 endpoints)
            "GET    /api/option-groups               — 옵션 그룹 목록",
            "POST   /api/option-groups               — 옵션 그룹 생성",
            "PUT    /api/option-groups/{group_id}    — 옵션 그룹 수정",
            "DELETE /api/option-groups/{group_id}    — 옵션 그룹 삭제",
            "POST   /api/option-groups/{group_id}/menus/{menu_id}  — 메뉴-옵션 연결",
            "DELETE /api/option-groups/{group_id}/menus/{menu_id}  — 메뉴-옵션 해제",
            # C5: Order (6 endpoints)
            "POST   /api/orders                      — 주문 생성",
            "GET    /api/orders                      — 현재 세션 주문 목록",
            "PATCH  /api/orders/{order_id}/status    — 주문 상태 변경",
            "DELETE /api/orders/{order_id}           — 주문 삭제 (관리자)",
            "GET    /api/orders/polling              — 폴링 데이터",
            "GET    /api/orders/receipt              — 영수증 조회",
            # C6: Recommendation (1 endpoint)
            "POST   /api/recommendations             — 추천 메뉴 조회",
        ],
    },
]
