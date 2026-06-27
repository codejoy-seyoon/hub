-- ============================================================
-- BNI Hub — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하세요.
-- 결제 도메인: store / ebook / training / reservation 공통 주문/결제 파이프라인
-- ============================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 주문 ----------
create table if not exists public.orders (
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
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,

  item_kind text not null,          -- product / book / training / space / addon
  ref_id text not null,             -- 카탈로그 식별자
  product_name text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0),

  created_at timestamptz not null default now()
);

-- ---------- 결제 시도 ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,

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
create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- 이행(fulfillment) 테이블 ----------
-- 대관 예약: 시간 충돌 확인 + 내 예약 조회에 사용
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
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
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  training_id text not null,
  customer_name text not null,
  customer_phone text not null,
  amount bigint not null default 0,
  status text not null default 'enrolled'
    check (status in ('enrolled', 'canceled')),
  created_at timestamptz not null default now()
);

-- 이북 열람 권한
create table if not exists public.ebook_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  book_id text not null,
  customer_email text not null,
  customer_phone text not null,
  granted_at timestamptz not null default now(),
  unique (book_id, customer_email)
);

-- ---------- 인덱스 ----------
create index if not exists idx_orders_toss_order_id on public.orders(toss_order_id);
create index if not exists idx_orders_phone on public.orders(customer_phone);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_payment_key on public.payments(payment_key);
create index if not exists idx_reservations_space_date on public.reservations(space_id, date);
create index if not exists idx_enrollments_phone on public.enrollments(customer_phone);

-- ---------- updated_at 트리거 ----------
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- ============================================================
-- RLS: 서버(api route)는 service_role 키로 접근하므로 RLS를 우회한다.
-- 클라이언트(anon)에서 직접 테이블을 읽지 않는 설계이므로
-- 우선 RLS를 켜고 정책은 비워 둔다(= anon 직접 접근 차단).
-- 추후 "내 주문만 조회" 등을 열 때 정책을 추가한다.
-- ============================================================
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.payments          enable row level security;
alter table public.payment_events    enable row level security;
alter table public.reservations      enable row level security;
alter table public.enrollments       enable row level security;
alter table public.ebook_entitlements enable row level security;
