import { NextResponse } from "next/server";
import { getTossPayment, getTossPaymentByOrderId } from "@/lib/toss";
import {
  getOrderByTossId,
  getLatestPayment,
  updatePayment,
  updateOrder,
  logEvent,
  fulfill,
} from "@/lib/orderStore";

export const runtime = "nodejs";

/**
 * 토스페이먼츠 웹훅 수신.
 * - 웹훅 본문은 신뢰하지 않고, paymentKey/orderId로 토스 API에서 권위있는 상태를 재조회한다.
 * - 가상계좌 입금완료(DONE), 결제취소(CANCELED/PARTIAL_CANCELED) 등 상태를 DB에 반영.
 * 토스 개발자센터 > 웹훅에 이 URL을 등록: {SITE}/api/payments/webhook
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "invalid body" }, { status: 400 });
  }

  // 토스 웹훅 payload: { eventType, data: { paymentKey, orderId, status, ... } }
  const data = (body.data ?? body) as Record<string, unknown>;
  const paymentKey = (data.paymentKey as string) || "";
  const orderId = (data.orderId as string) || "";

  if (!paymentKey && !orderId) {
    return NextResponse.json({ ok: false, message: "no paymentKey/orderId" }, { status: 400 });
  }

  // 권위있는 상태 재조회
  const fetched = paymentKey
    ? await getTossPayment(paymentKey)
    : await getTossPaymentByOrderId(orderId);

  if (!fetched.ok) {
    return NextResponse.json({ ok: false, message: "toss lookup failed" }, { status: 200 });
  }

  const pd = fetched.data as Record<string, unknown>;
  const realOrderId = (pd.orderId as string) || orderId;
  const status = (pd.status as string) || "";

  const order = await getOrderByTossId(realOrderId);
  if (!order) {
    // 우리 주문이 아니면 200으로 무시 (재시도 방지)
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = await getLatestPayment(order.id);
  await logEvent({
    order_id: order.id,
    payment_id: payment?.id ?? null,
    event_type: `webhook.${(body.eventType as string) || status || "unknown"}`,
    payload: pd,
  });

  const approvedAmount = Number(pd.totalAmount ?? order.total_amount);

  if (status === "DONE") {
    // 가상계좌 입금완료 등 → 결제완료 반영 + 이행 (멱등)
    if (payment && payment.status !== "paid") {
      await updatePayment(payment.id, {
        status: "paid",
        payment_key: (pd.paymentKey as string) || payment.payment_key,
        approved_amount: approvedAmount,
        method: (pd.method as string) ?? payment.method,
        raw_confirm_response: pd,
      });
      await updateOrder(order.id, {
        status: "paid",
        paid_amount: approvedAmount,
        paid_at: new Date().toISOString(),
      });
      try {
        await fulfill(order, approvedAmount);
      } catch (e) {
        await logEvent({
          order_id: order.id,
          payment_id: payment.id,
          event_type: "fulfillment.failed",
          payload: { source: "webhook", message: e instanceof Error ? e.message : String(e) },
        });
      }
    }
  } else if (status === "CANCELED" || status === "PARTIAL_CANCELED") {
    if (payment) await updatePayment(payment.id, { status: "canceled", raw_confirm_response: pd });
    await updateOrder(order.id, { status: "canceled" });
  } else if (status === "EXPIRED" || status === "ABORTED") {
    if (payment) await updatePayment(payment.id, { status: "failed", raw_confirm_response: pd });
    await updateOrder(order.id, { status: "payment_failed" });
  }

  return NextResponse.json({ ok: true });
}
