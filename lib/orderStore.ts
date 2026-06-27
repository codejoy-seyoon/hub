import "server-only";

/* ============================================================
   주문/결제 데이터 접근 계층
   - Supabase 환경변수가 제대로 설정돼 있으면 Supabase 사용
   - 아니면 인메모리 폴백 (로컬에서 Supabase 없이도 토스 결제 흐름 동작)
     ⚠️ 인메모리는 서버 재시작 시 사라짐. 개발/데모 용도.
   ============================================================ */

export type OrderRecord = {
  id: string;
  order_no: string;
  toss_order_id: string;
  user_id: string | null;
  domain: "store" | "ebook" | "training" | "reservation";
  status: string;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  paid_amount: number;
  paid_at: string | null;
  fulfillment: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PaymentRecord = {
  id: string;
  order_id: string;
  attempt_no: number;
  provider: string;
  provider_order_id: string;
  payment_key: string | null;
  status: string;
  requested_amount: number;
  approved_amount: number;
  currency: string;
  method: string | null;
  receipt_url: string | null;
  raw_confirm_response: unknown;
};

export type OrderItemInput = {
  item_kind: string;
  ref_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

const PLACEHOLDERS = ["YOUR_PROJECT", "YOUR_SUPABASE", "YOUR_", ""];

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const bad = (v: string) => !v || PLACEHOLDERS.some((p) => p && v.includes(p));
  return !bad(url) && url.startsWith("http") && !bad(anon) && !bad(svc);
}

/* ---------------- 인메모리 저장소 ---------------- */
type Mem = {
  orders: Map<string, OrderRecord>;
  payments: PaymentRecord[];
  reservations: { space_id: string; date: string; start_time: string; duration_minutes: number; status: string }[];
};
// 개발 중 HMR로 모듈이 다시 평가돼도 데이터가 유지되도록 globalThis에 보관
const g = globalThis as unknown as { __bniMem?: Mem };
const mem: Mem =
  g.__bniMem ??
  (g.__bniMem = { orders: new Map(), payments: [], reservations: [] });

function now() {
  return new Date().toISOString();
}

/* ---------------- 공개 API ---------------- */

export async function createOrder(input: Omit<OrderRecord, "id" | "created_at" | "updated_at" | "paid_amount" | "paid_at"> & { paid_amount?: number }): Promise<OrderRecord> {
  const ts = now();
  const record: OrderRecord = {
    id: crypto.randomUUID(),
    paid_amount: 0,
    paid_at: null,
    created_at: ts,
    updated_at: ts,
    ...input,
  };

  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_no: record.order_no,
        toss_order_id: record.toss_order_id,
        user_id: record.user_id,
        domain: record.domain,
        status: record.status,
        currency: record.currency,
        customer_name: record.customer_name,
        customer_email: record.customer_email,
        customer_phone: record.customer_phone,
        subtotal_amount: record.subtotal_amount,
        discount_amount: record.discount_amount,
        shipping_amount: record.shipping_amount,
        total_amount: record.total_amount,
        fulfillment: record.fulfillment,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "주문 생성 실패");
    return data as OrderRecord;
  }

  mem.orders.set(record.toss_order_id, record);
  return record;
}

export async function insertOrderItems(orderId: string, items: OrderItemInput[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { error } = await supabaseAdmin
      .from("order_items")
      .insert(items.map((i) => ({ order_id: orderId, ...i })));
    if (error) throw new Error(error.message);
    return;
  }
  // 인메모리에서는 주문 라인 별도 보관 불필요 (영수증/이행은 fulfillment로 충분)
}

export async function createPayment(input: {
  order_id: string;
  attempt_no: number;
  provider_order_id: string;
  requested_amount: number;
  currency: string;
}): Promise<PaymentRecord> {
  const record: PaymentRecord = {
    id: crypto.randomUUID(),
    order_id: input.order_id,
    attempt_no: input.attempt_no,
    provider: "toss_payments",
    provider_order_id: input.provider_order_id,
    payment_key: null,
    status: "initiated",
    requested_amount: input.requested_amount,
    approved_amount: 0,
    currency: input.currency,
    method: null,
    receipt_url: null,
    raw_confirm_response: null,
  };

  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: record.order_id,
        attempt_no: record.attempt_no,
        provider: record.provider,
        provider_order_id: record.provider_order_id,
        status: record.status,
        requested_amount: record.requested_amount,
        approved_amount: 0,
        currency: record.currency,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "결제 생성 실패");
    return data as PaymentRecord;
  }

  mem.payments.push(record);
  return record;
}

export async function getOrderByTossId(tossOrderId: string): Promise<OrderRecord | null> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("toss_order_id", tossOrderId)
      .single();
    return (data as OrderRecord) ?? null;
  }
  return mem.orders.get(tossOrderId) ?? null;
}

export async function getLatestPayment(orderId: string): Promise<PaymentRecord | null> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .order("attempt_no", { ascending: false })
      .limit(1)
      .single();
    return (data as PaymentRecord) ?? null;
  }
  const list = mem.payments.filter((p) => p.order_id === orderId).sort((a, b) => b.attempt_no - a.attempt_no);
  return list[0] ?? null;
}

export async function updatePayment(id: string, patch: Partial<PaymentRecord>): Promise<void> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    await supabaseAdmin.from("payments").update(patch).eq("id", id);
    return;
  }
  const p = mem.payments.find((x) => x.id === id);
  if (p) Object.assign(p, patch);
}

export async function updateOrder(id: string, patch: Partial<OrderRecord>): Promise<void> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    await supabaseAdmin.from("orders").update(patch).eq("id", id);
    return;
  }
  for (const o of mem.orders.values()) {
    if (o.id === id) {
      Object.assign(o, patch, { updated_at: now() });
      break;
    }
  }
}

export async function logEvent(evt: {
  order_id: string;
  payment_id: string | null;
  event_type: string;
  payload: unknown;
}): Promise<void> {
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    await supabaseAdmin.from("payment_events").insert(evt);
    return;
  }
  // 인메모리에서는 콘솔 로그로 대체
  console.log(`[payment_event] ${evt.event_type}`, JSON.stringify(evt.payload).slice(0, 300));
}

/* ---------------- 도메인별 이행 ---------------- */

export async function fulfill(order: OrderRecord, approvedAmount: number): Promise<void> {
  const f = order.fulfillment || {};

  if (order.domain === "reservation") {
    const row = {
      space_id: String(f.spaceId ?? ""),
      date: String(f.date ?? ""),
      start_time: String(f.time ?? ""),
      duration_minutes: Number(f.durationMinutes ?? 60),
      status: "confirmed",
    };
    if (isSupabaseConfigured()) {
      const { supabaseAdmin } = await import("./supabase/admin");
      await supabaseAdmin.from("reservations").insert({
        order_id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        memo: (f.memo as string) ?? "",
        amount: approvedAmount,
        ...row,
      });
    } else {
      mem.reservations.push(row);
    }
  } else if (order.domain === "training") {
    if (isSupabaseConfigured()) {
      const { supabaseAdmin } = await import("./supabase/admin");
      await supabaseAdmin.from("enrollments").insert({
        order_id: order.id,
        training_id: String(f.trainingId ?? ""),
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        amount: approvedAmount,
        status: "enrolled",
      });
    }
  } else if (order.domain === "ebook") {
    const bookIds = Array.isArray(f.bookIds) ? (f.bookIds as string[]) : [];
    if (bookIds.length && isSupabaseConfigured()) {
      const { supabaseAdmin } = await import("./supabase/admin");
      await supabaseAdmin.from("ebook_entitlements").upsert(
        bookIds.map((bookId) => ({
          order_id: order.id,
          book_id: bookId,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
        })),
        { onConflict: "book_id,customer_email", ignoreDuplicates: true }
      );
    }
  }
}

export type JourneyOrder = {
  order_no: string;
  domain: string;
  status: string;
  total_amount: number;
  paid_at: string | null;
  created_at: string;
  fulfillment: Record<string, unknown>;
};

/** 전화번호로 주문 내역 조회 (내 주문/예약/수강/구매 통합 조회) */
export async function getOrdersByPhone(phone: string): Promise<JourneyOrder[]> {
  const norm = String(phone || "").replace(/\D/g, "");
  if (!norm) return [];

  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data } = await supabaseAdmin
      .from("orders")
      .select("order_no, domain, status, total_amount, paid_at, created_at, fulfillment")
      .eq("customer_phone", norm)
      .order("created_at", { ascending: false });
    return (data as JourneyOrder[]) ?? [];
  }

  return [...mem.orders.values()]
    .filter((o) => o.customer_phone.replace(/\D/g, "") === norm)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => ({
      order_no: o.order_no,
      domain: o.domain,
      status: o.status,
      total_amount: o.total_amount,
      paid_at: o.paid_at,
      created_at: o.created_at,
      fulfillment: o.fulfillment,
    }));
}

export async function getBusy(spaceId: string, date: string): Promise<{ startMin: number; endMin: number }[]> {
  let rows: { start_time: string; duration_minutes: number }[] = [];
  if (isSupabaseConfigured()) {
    const { supabaseAdmin } = await import("./supabase/admin");
    const { data } = await supabaseAdmin
      .from("reservations")
      .select("start_time, duration_minutes")
      .eq("space_id", spaceId)
      .eq("date", date)
      .eq("status", "confirmed");
    rows = data ?? [];
  } else {
    rows = mem.reservations.filter((r) => r.space_id === spaceId && r.date === date && r.status === "confirmed");
  }
  return rows.map((r) => {
    const [h, m] = String(r.start_time).split(":").map(Number);
    const startMin = h * 60 + m;
    return { startMin, endMin: startMin + (r.duration_minutes || 60) };
  });
}
