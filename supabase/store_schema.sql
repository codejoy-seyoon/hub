-- ============================================================
-- BNI STORE — 주문·결제 표 (Supabase 프로젝트 「bni pay」 안의 store 방)
-- 2026-11-17 · HST-54
--
-- 무엇을 하나
--   1) store 라는 방(schema)을 만들고 주문·결제 표 7개를 그 안에 둔다.
--   2) store_app 이라는 전용 역할을 만들어 store 방에만 권한을 준다.
--      스토어 서버는 만능 열쇠(service_role) 대신 이 역할로만 접속한다.
--   3) pay 쪽 표(public.pay_*)와 예약 작업은 건드리지 않는다.
--
-- 여러 번 실행해도 같은 결과가 되도록 썼다(if not exists).
-- 실행 뒤에는 store_schema_check.sql 로 권한을 확인한다.
-- ============================================================

create extension if not exists pgcrypto;

create schema if not exists store;


create or replace function store.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 주문 ----------
create table if not exists store.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  toss_order_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,

  -- 결제 도메인
  domain text not null
    check (domain in ('store', 'ebook', 'training', 'reservation')),

  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'payment_failed', 'paid', 'canceled')),

  currency char(3) not null default 'KRW',

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  subtotal_amount bigint not null default 0 check (subtotal_amount >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  shipping_amount bigint not null default 0 check (shipping_amount >= 0),
  total_amount bigint not null check (total_amount >= 0),

  paid_amount bigint not null default 0 check (paid_amount >= 0),
  paid_at timestamptz,

  -- 결제 후 이행에 필요한 도메인별 정보 (예약 일시/공간, 도서 id 등)
  fulfillment jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 주문 상품(라인) ----------
create table if not exists store.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store.orders(id) on delete cascade,

  item_kind text not null,          -- product / book / training / space / addon
  ref_id text not null,             -- 카탈로그 식별자
  product_name text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0),

  created_at timestamptz not null default now()
);

-- ---------- 결제 시도 ----------
create table if not exists store.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store.orders(id) on delete restrict,

  attempt_no integer not null,
  provider text not null default 'toss_payments',
  provider_order_id text not null,
  payment_key text unique,

  status text not null default 'initiated'
    check (status in ('initiated', 'confirming', 'paid', 'failed', 'canceled')),

  requested_amount bigint not null check (requested_amount >= 0),
  approved_amount bigint not null default 0 check (approved_amount >= 0),
  currency char(3) not null default 'KRW',

  method text,
  receipt_url text,
  raw_confirm_response jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(order_id, attempt_no)
);

-- ---------- 결제 이벤트 로그 ----------
create table if not exists store.payment_events (
  id bigint generated always as identity primary key,
  order_id uuid references store.orders(id) on delete set null,
  payment_id uuid references store.payments(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- 이행(fulfillment) 테이블 ----------
-- 대관 예약: 시간 충돌 확인 + 내 예약 조회에 사용
create table if not exists store.reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references store.orders(id) on delete set null,
  space_id text not null,
  customer_name text not null,
  customer_phone text not null,
  date date not null,
  start_time text not null,           -- HH:MM
  duration_minutes integer not null check (duration_minutes > 0),
  memo text,
  amount bigint not null default 0,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'canceled')),
  created_at timestamptz not null default now()
);

-- 트레이닝 수강 신청
create table if not exists store.enrollments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references store.orders(id) on delete set null,
  training_id text not null,
  customer_name text not null,
  customer_phone text not null,
  amount bigint not null default 0,
  status text not null default 'enrolled'
    check (status in ('enrolled', 'canceled')),
  created_at timestamptz not null default now()
);

-- 이북 열람 권한
create table if not exists store.ebook_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references store.orders(id) on delete set null,
  book_id text not null,
  customer_email text not null,
  customer_phone text not null,
  granted_at timestamptz not null default now(),
  unique (book_id, customer_email)
);

-- ---------- 인덱스 ----------
create index if not exists idx_orders_toss_order_id on store.orders(toss_order_id);
create index if not exists idx_orders_phone on store.orders(customer_phone);
create index if not exists idx_order_items_order_id on store.order_items(order_id);
create index if not exists idx_payments_order_id on store.payments(order_id);
create index if not exists idx_payments_payment_key on store.payments(payment_key);
create index if not exists idx_reservations_space_date on store.reservations(space_id, date);
create index if not exists idx_enrollments_phone on store.enrollments(customer_phone);

-- ---------- updated_at 트리거 ----------
drop trigger if exists trg_orders_updated_at on store.orders;
create trigger trg_orders_updated_at
before update on store.orders
for each row execute function store.set_updated_at();

drop trigger if exists trg_payments_updated_at on store.payments;
create trigger trg_payments_updated_at
before update on store.payments
for each row execute function store.set_updated_at();

-- ============================================================
-- 전용 역할: store_app
--   - 로그인 불가(nologin): 직접 접속용 계정이 아니라, API가 요청마다 잠깐 갈아입는 역할이다.
--   - authenticator(API 문지기)에게 이 역할로 바꿔 입을 자격을 준다.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'store_app') then
    create role store_app nologin noinherit;
  end if;
end
$$;

grant store_app to authenticator;

-- store 방 사용 권한: store_app(스토어 서버)과 service_role(관리자)만.
-- anon·authenticated 에는 아무것도 주지 않는다 = 공개 열쇠만으로는 이 방을 볼 수 없다.
grant usage on schema store to store_app, service_role;
grant select, insert, update, delete on all tables in schema store to store_app, service_role;
grant usage, select on all sequences in schema store to store_app, service_role;
grant execute on all routines in schema store to store_app, service_role;

alter default privileges for role postgres in schema store
  grant select, insert, update, delete on tables to store_app, service_role;
alter default privileges for role postgres in schema store
  grant usage, select on sequences to store_app, service_role;
alter default privileges for role postgres in schema store
  grant execute on routines to store_app, service_role;

-- store_app 이 주문의 user_id(로그인 회원 연결)를 검사할 수 있게 참조 권한은 필요 없다
-- (외래 키 검사는 표 주인 권한으로 수행된다).

-- ============================================================
-- RLS: 표마다 켜고, store_app 에게만 전체 허용 정책을 준다.
--   권한(grant)과 정책(RLS) 두 겹으로 막는다.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['orders','order_items','payments','payment_events','reservations','enrollments','ebook_entitlements']
  loop
    execute format('alter table store.%I enable row level security', t);
    execute format('drop policy if exists store_app_all on store.%I', t);
    execute format('create policy store_app_all on store.%I for all to store_app using (true) with check (true)', t);
  end loop;
end
$$;
