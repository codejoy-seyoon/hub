import { NextResponse } from "next/server";
import { buildOrder, orderRequestSchema } from "@/lib/catalog";
import {
  createOrder,
  insertOrderItems,
  createPayment,
  logEvent,
  isSupabaseConfigured,
} from "@/lib/orderStore";

export const runtime = "nodejs";

function createOrderNo(prefix = "ORD") {
  // 주문번호의 날짜·시각은 항상 한국 시간으로 찍는다.
  // 서버(Cloudflare) 시계는 세계 표준시라 그대로 쓰면 자정~오전 9시 주문이 하루 전 날짜가 된다.
  // 한국은 서머타임이 없어 9시간을 더한 뒤 표준시 기준으로 읽으면 된다.
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts =
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  return `${prefix}-${ts}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = orderRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." },
        { status: 400 }
      );
    }

    // 금액은 서버 카탈로그로 재계산 (클라이언트 가격 신뢰 금지)
    let built;
    try {
      built = buildOrder(parsed.data);
    } catch (e) {
      return NextResponse.json(
        { message: e instanceof Error ? e.message : "주문 검증에 실패했습니다." },
        { status: 400 }
      );
    }

    const { customer } = parsed.data;
    // 행사 주문은 번호 앞에 행사 코드를 단다(예: EVT-NC26-…). 나중에 행사별로 모아 보기 쉽다.
    const orderNo =
      parsed.data.domain === "event"
        ? createOrderNo(`EVT-${parsed.data.eventCode.toUpperCase()}`)
        : createOrderNo();
    const tossOrderId = orderNo;

    // 로그인 사용자 연결 (Supabase 설정된 경우에만 시도)
    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    const order = await createOrder({
      order_no: orderNo,
      toss_order_id: tossOrderId,
      user_id: userId,
      domain: built.domain,
      status: "pending_payment",
      currency: built.currency ?? "KRW",
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      subtotal_amount: built.amounts.subtotal,
      discount_amount: built.amounts.discount,
      shipping_amount: built.amounts.shipping,
      total_amount: built.amounts.total,
      fulfillment: built.fulfillment,
    });

    await insertOrderItems(
      order.id,
      built.lines.map((l) => ({
        item_kind: l.kind,
        ref_id: l.refId,
        product_name: l.name,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
      }))
    );

    const payment = await createPayment({
      order_id: order.id,
      attempt_no: 1,
      provider_order_id: tossOrderId,
      requested_amount: built.amounts.total,
      currency: built.currency ?? "KRW",
    });

    await logEvent({
      order_id: order.id,
      payment_id: payment.id,
      event_type: "order.created",
      payload: {
        domain: built.domain,
        orderNo,
        tossOrderId,
        amount: built.amounts.total,
        customer,
        lines: built.lines,
      },
    });

    return NextResponse.json({
      orderId: tossOrderId,
      internalOrderId: order.id,
      domain: built.domain,
      orderName: built.orderName,
      amount: built.amounts.total,
      currency: built.currency ?? "KRW",
      customerKey: userId ?? `guest-${orderNo}`,
      customer,
      lines: built.lines,
      amounts: built.amounts,
      storage: isSupabaseConfigured() ? "supabase" : "memory",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "주문 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
