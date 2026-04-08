# 도메인 엔티티 - backend-api

## 엔티티 관계 다이어그램

```
Store 1---* Admin
Store 1---* Table
Store 1---* Category
Store 1---* Menu
Store 1---* OptionGroup

Table 1---* TableSession

TableSession 1---* Order

Category 1---* Menu

Menu *---* OptionGroup  (via MenuOptionGroup)

OptionGroup 1---* OptionItem

Order 1---* OrderItem

OrderItem 1---* OrderItemOption

OrderHistory (아카이브, Order와 동일 구조)
```

---

## 엔티티 정의

### Store (매장)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 매장 고유 식별자 |
| name | String(100) | NOT NULL | 매장명 |
| default_prep_time_minutes | Integer | NOT NULL, DEFAULT 15 | 기본 준비 시간 (분) |
| created_at | DateTime | NOT NULL | 생성 시각 |
| updated_at | DateTime | NOT NULL | 수정 시각 |

### Admin (관리자)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 관리자 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| username | String(50) | NOT NULL, UNIQUE(store_id, username) | 사용자명 |
| password_hash | String(255) | NOT NULL | bcrypt 해시 |
| login_attempts | Integer | NOT NULL, DEFAULT 0 | 로그인 시도 횟수 |
| locked_until | DateTime | NULLABLE | 잠금 해제 시각 |
| created_at | DateTime | NOT NULL | 생성 시각 |

### Table (테이블)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 테이블 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| table_number | Integer | NOT NULL, UNIQUE(store_id, table_number) | 테이블 번호 |
| password_hash | String(255) | NOT NULL | 태블릿 인증용 bcrypt 해시 |
| created_at | DateTime | NOT NULL | 생성 시각 |

### TableSession (테이블 세션)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 세션 고유 식별자 |
| table_id | UUID | FK(Table), NOT NULL | 테이블 |
| store_id | UUID | FK(Store), NOT NULL | 매장 |
| status | Enum | NOT NULL, DEFAULT 'active' | active / completed |
| started_at | DateTime | NOT NULL | 세션 시작 시각 |
| completed_at | DateTime | NULLABLE | 이용 완료 시각 |

### Category (카테고리)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 카테고리 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | String(50) | NOT NULL | 카테고리명 |
| sort_order | Integer | NOT NULL, DEFAULT 0 | 정렬 순서 |

### Menu (메뉴)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 메뉴 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| category_id | UUID | FK(Category), NOT NULL | 카테고리 |
| name | String(100) | NOT NULL | 메뉴명 |
| price | Integer | NOT NULL, >= 0 | 가격 (원) |
| description | Text | NULLABLE | 메뉴 설명 |
| image_url | String(500) | NULLABLE | S3 이미지 URL |
| sort_order | Integer | NOT NULL, DEFAULT 0 | 노출 순서 |
| is_popular | Boolean | NOT NULL, DEFAULT false | 관리자 수동 인기 지정 |
| is_available | Boolean | NOT NULL, DEFAULT true | 판매 가능 여부 |
| created_at | DateTime | NOT NULL | 생성 시각 |
| updated_at | DateTime | NOT NULL | 수정 시각 |

### OptionGroup (옵션 그룹)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 옵션 그룹 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | String(50) | NOT NULL | 그룹명 (예: 맵기, 사이즈) |
| is_required | Boolean | NOT NULL, DEFAULT false | 필수 선택 여부 |
| created_at | DateTime | NOT NULL | 생성 시각 |

### OptionItem (옵션 항목)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 옵션 항목 고유 식별자 |
| option_group_id | UUID | FK(OptionGroup), NOT NULL | 소속 그룹 |
| name | String(50) | NOT NULL | 항목명 (예: 보통맛, 매운맛) |
| extra_price | Integer | NOT NULL, DEFAULT 0 | 추가 가격 (원) |
| sort_order | Integer | NOT NULL, DEFAULT 0 | 정렬 순서 |

### MenuOptionGroup (메뉴-옵션 연결)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 연결 고유 식별자 |
| menu_id | UUID | FK(Menu), NOT NULL | 메뉴 |
| option_group_id | UUID | FK(OptionGroup), NOT NULL | 옵션 그룹 |
| UNIQUE(menu_id, option_group_id) | | | 중복 연결 방지 |

### Order (주문)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 주문 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 매장 |
| table_id | UUID | FK(Table), NOT NULL | 테이블 |
| session_id | UUID | FK(TableSession), NOT NULL | 세션 |
| order_number | String(20) | NOT NULL, UNIQUE | 주문 번호 (표시용) |
| round | Integer | NOT NULL | 주문 회차 (1, 2, 3...) |
| status | Enum | NOT NULL, DEFAULT 'pending' | pending / preparing / completed |
| total_amount | Integer | NOT NULL | 총 금액 (원) |
| created_at | DateTime | NOT NULL | 주문 시각 |
| updated_at | DateTime | NOT NULL | 상태 변경 시각 |

### OrderItem (주문 항목)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 항목 고유 식별자 |
| order_id | UUID | FK(Order), NOT NULL | 주문 |
| menu_id | UUID | FK(Menu), NOT NULL | 메뉴 |
| menu_name | String(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | Integer | NOT NULL, >= 1 | 수량 |
| unit_price | Integer | NOT NULL | 주문 시점 단가 (스냅샷) |
| option_total_price | Integer | NOT NULL, DEFAULT 0 | 옵션 추가 가격 합계 |
| subtotal | Integer | NOT NULL | (unit_price + option_total_price) * quantity |

### OrderItemOption (주문 항목 옵션)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 고유 식별자 |
| order_item_id | UUID | FK(OrderItem), NOT NULL | 주문 항목 |
| option_group_name | String(50) | NOT NULL | 옵션 그룹명 (스냅샷) |
| option_item_name | String(50) | NOT NULL | 옵션 항목명 (스냅샷) |
| extra_price | Integer | NOT NULL | 추가 가격 (스냅샷) |

### OrderHistory (주문 이력)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | UUID | PK | 이력 고유 식별자 |
| original_order_id | UUID | NOT NULL | 원본 주문 ID |
| store_id | UUID | NOT NULL | 매장 |
| table_id | UUID | NOT NULL | 테이블 |
| session_id | UUID | NOT NULL | 세션 |
| order_number | String(20) | NOT NULL | 주문 번호 |
| round | Integer | NOT NULL | 주문 회차 |
| total_amount | Integer | NOT NULL | 총 금액 |
| items_snapshot | JSONB | NOT NULL | 주문 항목+옵션 전체 JSON |
| ordered_at | DateTime | NOT NULL | 원본 주문 시각 |
| archived_at | DateTime | NOT NULL | 아카이빙 시각 |

> **설계 결정**: OrderItem/OrderItemOption에 메뉴명/옵션명/가격을 스냅샷으로 저장합니다.
> 메뉴 가격이나 이름이 변경되어도 과거 주문 데이터의 정합성을 보장합니다.

> **보관 정책**: OrderHistory는 무제한 보관합니다.
