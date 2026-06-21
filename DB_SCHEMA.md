# BNI Korea Hub — 통합 데이터베이스 설계

한 명의 유저가 hub의 모든 서비스(**제품 구매 · 트레이닝 · 대관**)를 이용한 여정(journey)이
하나의 히스토리로 기록·관리되도록 설계한다.

- **유저 식별 = 전화번호(통합 키).** 별도 로그인 없음.
- 모든 서비스 행위는 `activities`(통합 여정 로그)에 한 줄씩 적재 → 유저별 전체 여정을 한 곳에서 조회.
- 현재 구현: 아래 관계형 스키마를 `shared/data.js`(localStorage)에 1:1로 매핑.
  추후 실제 DB(Supabase/Postgres)로 옮길 때 테이블 구조가 동일해 교체가 쉽다.

---

## ERD (개념)

```
                         ┌─────────────┐
                         │    users    │  (전화번호 통합 키)
                         └──────┬──────┘
        ┌───────────────┬──────┼───────────────┬───────────────┐
        │               │      │               │               │
   ┌────▼────┐   ┌──────▼────┐ │        ┌──────▼──────┐  ┌──────▼──────┐
   │ orders  │   │enrollments│ │        │reservations │  │ activities  │
   └────┬────┘   └─────┬─────┘ │        └──────┬──────┘  │ (여정 로그) │
        │              │       │               │         └─────────────┘
   ┌────▼──────┐  ┌────▼─────┐ │          ┌────▼────┐
   │order_items│  │ trainings│ │          │ spaces  │
   └────┬──────┘  └──────────┘ │          └─────────┘
        │                      │
   ┌────▼─────┐          ┌─────▼────┐
   │ products │          │  events  │ (캘린더, 유저 무관)
   └──────────┘          └──────────┘
```

---

## 테이블 정의

### users — 여정의 주체
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | PK | 내부 식별자 |
| name | text | 이름 |
| phone | text **UNIQUE** | **통합 키**(숫자만 저장) |
| email | text | 이메일(선택) |
| created_at | timestamp | 최초 등록 시각 |

### products — 상품
`id PK, name, category, price, img, stock` (재고 0 = 품절)

### orders — 제품 구매(주문)
`id PK, user_id FK→users, total, status, created_at`

### order_items — 주문 상세
`id PK, order_id FK→orders, product_id FK→products, qty, unit_price`

### trainings — 트레이닝
`id PK, day, title, chapter, who, time, status, price`

### enrollments — 트레이닝 신청/구매
`id PK, user_id FK→users, training_id FK→trainings, amount, status, created_at`

### events — 캘린더 일정 (유저와 무관)
`id PK, day, title, color`

### spaces — 대관 가능한 공간(회의실)
`id PK, name, area(㎡), capacity(인), hourly_price`

### reservations — 대관 예약
`id PK, user_id FK→users, space_id FK→spaces, date(YYYY-MM-DD), time(HH:mm), duration(분), memo, email, status, created_at`

### activities — 통합 여정 로그 ★
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | PK | |
| user_id | FK→users | 누구의 행위인가 |
| type | enum | `order` \| `enrollment` \| `reservation` |
| ref_id | text | 원본 레코드 id (order/enrollment/reservation) |
| title | text | 표시용 요약 |
| amount | number | 금액 |
| created_at | timestamp | 발생 시각 |

> **단일 기록 지점:** `addOrder` / `addEnrollment` / `addReservation` 헬퍼가
> 원본 레코드 저장과 `activities` 적재를 함께 처리한다(중복 로깅 방지).

---

## 관계 요약
- users 1 — N orders / enrollments / reservations / activities
- orders 1 — N order_items, order_items N — 1 products
- enrollments N — 1 trainings
- reservations N — 1 spaces

## localStorage 키 매핑
`bni_users, bni_products, bni_events, bni_trainings, bni_orders,
bni_order_items, bni_enrollments, bni_spaces, bni_reservations, bni_activities`

## 실제 DB 이관 시
`shared/data.js`의 `read/write`를 API 호출로 바꾸고, 각 `get*/add*` 헬퍼 내부를
해당 테이블 쿼리로 교체하면 화면 코드는 그대로 동작한다.
