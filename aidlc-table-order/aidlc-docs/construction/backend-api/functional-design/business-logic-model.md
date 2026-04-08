# 비즈니스 로직 모델 - backend-api

## 1. 인증 플로우

### 관리자 로그인
```
입력: store_id, username, password
  |
  +-- 계정 잠금 확인 (locked_until > now?)
  |     +-- Yes → 에러: "계정 잠김, N분 후 재시도"
  |
  +-- 관리자 조회 (store_id + username)
  |     +-- 없음 → 에러: "인증 실패"
  |
  +-- bcrypt 비밀번호 검증
  |     +-- 실패 → login_attempts++ 
  |     |          +-- 5회 이상 → locked_until = now + 15분
  |     |          +-- 에러: "인증 실패"
  |
  +-- login_attempts 리셋 → 0
  +-- JWT 발급 (role=admin, store_id, expires=16시간)
  +-- 반환: access_token, refresh_token
```

### 테이블 자동 로그인
```
입력: store_id, table_number, password
  |
  +-- 테이블 조회 (store_id + table_number)
  |     +-- 없음 → 에러: "테이블 없음"
  |
  +-- bcrypt 비밀번호 검증
  |     +-- 실패 → 에러: "인증 실패"
  |
  +-- JWT 발급 (role=table, store_id, table_id, expires=16시간)
  +-- 반환: access_token, refresh_token
```

---

## 2. 주문 생성 플로우

```
입력: table_id, session_id (from JWT), items[{menu_id, quantity, options[{option_item_id}]}]
  |
  +-- 활성 세션 확인
  |     +-- 세션 없음 → 새 세션 생성 (status=active)
  |
  +-- 회차 계산: 해당 세션의 기존 주문 수 + 1
  |
  +-- 각 항목 검증:
  |     +-- menu_id 존재 및 is_available 확인
  |     +-- 옵션 유효성: option_item_id가 해당 메뉴에 연결된 그룹의 항목인지 확인
  |     +-- 필수 옵션 그룹 체크: is_required=true인 그룹에서 하나 이상 선택 확인
  |
  +-- 금액 계산:
  |     +-- 각 항목: (menu.price + sum(option.extra_price)) * quantity
  |     +-- 총액: sum(모든 항목의 subtotal)
  |
  +-- 주문 번호 생성: YYYYMMDD-NNNN (당일 순번)
  |
  +-- Order 저장 (round, total_amount)
  +-- OrderItem 저장 (스냅샷: menu_name, unit_price)
  +-- OrderItemOption 저장 (스냅샷: group_name, item_name, extra_price)
  |
  +-- 반환: order_id, order_number, round
```

---

## 3. 주문 상태 전이

```
pending (대기중) → preparing (준비중) → completed (완료)

허용 전이:
  pending → preparing    (관리자 액션)
  preparing → completed  (관리자 액션)

금지 전이:
  completed → *          (완료 후 변경 불가)
  pending → completed    (준비중 건너뛰기 불가)
  preparing → pending    (역방향 불가)
```

---

## 4. 테이블 세션 라이프사이클

```
[세션 없음]
    |
    +-- 첫 주문 생성 시 → 새 세션 생성 (status=active)
    |
[active 세션]
    |
    +-- 추가 주문 가능 (round 증가)
    +-- 주문 상태 변경 가능
    +-- 주문 삭제 가능
    |
    +-- 관리자 "이용 완료" 클릭
        |
        +-- 해당 세션의 모든 주문 → OrderHistory로 복사
        +-- 원본 Order, OrderItem, OrderItemOption 삭제
        +-- 세션 status = completed, completed_at = now
        |
[completed 세션]
    |
    +-- 과거 내역 조회 가능 (OrderHistory)
    +-- 새 주문 시 → 새 세션 자동 생성
```

---

## 5. 추천 로직

```
입력: menu_ids[] (장바구니 메뉴), store_id
  |
  +-- OrderHistory에서 menu_ids 중 하나 이상 포함된 과거 주문 검색
  |
  +-- 해당 주문들에서 menu_ids에 없는 다른 메뉴 추출
  |
  +-- 출현 빈도순 정렬 → 상위 5개 선택
  |
  +-- 결과가 0개인 경우:
  |     +-- 해당 매장의 메뉴 중 menu_ids에 없는 메뉴를 랜덤 5개 선택
  |
  +-- 각 추천 메뉴의 정보 (id, name, price, image_url) 반환
```

---

## 6. 인기 메뉴 판별 로직

**이중 판별**: 자동 + 수동

```
인기 메뉴 = is_popular=true (수동) OR 자동 판별

자동 판별:
  +-- 최근 30일간 OrderHistory + 현재 Order에서 메뉴별 주문 횟수 집계
  +-- 매장 내 상위 20% 메뉴를 자동 인기로 판별
  +-- 자동 판별은 조회 시 동적 계산 (캐싱 권장)

우선순위:
  +-- is_popular=true이면 무조건 인기
  +-- is_popular=false여도 자동 판별 기준 충족 시 인기
```

---

## 7. 예상 대기 시간 계산 로직

**이중 계산**: 평균 기반 + 관리자 기본값 폴백

```
입력: order_id
  |
  +-- 해당 주문의 메뉴 목록 조회
  |
  +-- 각 메뉴의 평균 준비 시간 계산:
  |     +-- 최근 7일간 동일 메뉴의 (완료 시각 - 생성 시각) 평균
  |     +-- 데이터 없으면 → 매장 default_prep_time_minutes 사용
  |
  +-- 주문의 예상 시간 = max(모든 메뉴의 예상 시간)  [병렬 조리 가정]
  |
  +-- 앞선 대기 주문 고려:
  |     +-- 해당 테이블의 pending/preparing 주문 중 현재 주문보다 앞선 것 수
  |     +-- 추가 대기 = 앞선 주문 수 * 평균 준비 시간의 50%  [동시 조리 고려]
  |
  +-- 총 예상 시간 = 주문 예상 시간 + 추가 대기
  +-- 진행률 = (경과 시간 / 총 예상 시간) * 100  [최대 99%]
```

---

## 8. 폴링 데이터 제공 로직

```
입력: store_id, since? (마지막 조회 시각)
  |
  +-- since 없음: 해당 매장의 모든 활성 테이블 + 현재 주문 전체 반환
  +-- since 있음: since 이후 변경된 주문만 반환 (created_at > since OR updated_at > since)
  |
  +-- 테이블별 그룹핑:
  |     +-- table_number
  |     +-- 현재 세션의 총 주문액
  |     +-- 최신 주문 N개 미리보기 (메뉴명, 수량 축약)
  |     +-- 신규 주문 여부 (since 이후 생성)
  |
  +-- 반환: tables[{table_info, total_amount, recent_orders[], has_new}]
```
