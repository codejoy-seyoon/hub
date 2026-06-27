import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmTossPayment } from "@/lib/toss";
import {
  getOrderByTossId,
  getLatestPayment,
  updatePayment,
  updateOrder,
  logEvent,
  fulfill,
} from "@/lib/orderStore";

export const runtime = "nodejs";

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." },
        { status: 400 }
      );
    }
    const { paymentKey, orderId, amount } = parsed.data;

    const order = await getOrderByTossId(orderId);
    if (!order) {
      return NextResponse.json({ message: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    const payment = await getLatestPayment(order.id);
    if (!payment) {
      return NextResponse.json({ message: "결제 시도를 찾을 수 없습니다." }, { status: 404 });
    }

    // 금액 검증
    if (Number(order.total_amount) !== amount) {
      await logEvent({
        order_id: order.id,
        payment_id: payment.id,
        event_type: "payment.confirm.amount_mismatch",
        payload: { receivedAmount: amount, expectedAmount: order.total_amount, paymentKey, orderId },
      });
      return NextResponse.json({ message: "결제 금액 검증에 실패했습니다." }, { status: 400 });
    }

    // 멱등: 이미 승인된 결제면 그대로 성공 반환
    if (payment.status === "paid") {
      return NextResponse.json({
        ok: true,
        alreadyConfirmed: true,
        order: {
          orderNo: order.order_no,
          tossOrderId: order.toss_order_id,
          domain: order.domain,
          amount: order.total_amount,
          status: order.status,
          customerName: order.customer_name,
        },
        payment: {
          paymentKey: payment.payment_key,
          method: payment.method,
          approvedAmount: payment.approved_amount,
          receiptUrl: payment.receipt_url,
        },
      });
    }

    await updatePayment(payment.id, { status: "confirming" });

    const confirmResult = await confirmTossPayment({ paymentKey, orderId, amount });

    if (!confirmResult.ok) {
      await updatePayment(payment.id, { status: "failed", raw_confirm_response: confirmResult.data });
      await updateOrder(order.id, { status: "payment_failed" });
      await logEvent({
        order_id: order.id,
        payment_id: payment.id,
        event_type: "payment.confirm.failed",
        payload: confirmResult.data,
      });
      return NextResponse.json(
        {
          message: confirmResult.data?.message ?? "결제 승인에 실패했습니다.",
          code: confirmResult.data?.code ?? "TOSS_CONFIRM_FAILED",
        },
        { status: 400 }
      );
    }

    const pd = confirmResult.data;
    const approvedAmount = Number(pd.totalAmount ?? amount);
    const method = pd.method ?? null;
    const receiptUrl = pd.receipt?.url ?? null;
    const tossStatus = (pd.status as string) || "DONE";
    // 가상계좌는 입금 전까지 WAITING_FOR_DEPOSIT → 결제완료(DONE) 아님
    const isDone = tossStatus === "DONE";

    await updatePayment(payment.id, {
      status: isDone ? "paid" : "confirming",
      payment_key: pd.paymentKey ?? paymentKey,
      approved_amount: isDone ? approvedAmount : 0,
      method,
      receipt_url: receiptUrl,
      raw_confirm_response: pd,
    });
    await updateOrder(
      order.id,
      isDone
        ? { status: "paid", paid_amount: approvedAmount, paid_at: new Date().toISOString() }
        : { status: "pending_payment" }
    );

    // 결제완료(DONE)일 때만 도메인별 이행 (가상계좌는 입금 시 웹훅에서 이행)
    if (isDone) {
      try {
        await fulfill(order, approvedAmount);
      } catch (e) {
        await logEvent({
          order_id: order.id,
          payment_id: payment.id,
          event_type: "fulfillment.failed",
          payload: { message: e instanceof Error ? e.message : String(e) },
        });
      }
    }

    await logEvent({
      order_id: order.id,
      payment_id: payment.id,
      event_type: isDone ? "payment.confirm.succeeded" : "payment.confirm.waiting_deposit",
      payload: pd,
    });

    return NextResponse.json({
      ok: true,
      paymentStatus: tossStatus,
      order: {
        orderNo: order.order_no,
        tossOrderId: order.toss_order_id,
        domain: order.domain,
        amount: isDone ? approvedAmount : order.total_amount,
        status: isDone ? "paid" : "pending_payment",
        customerName: order.customer_name,
        customerEmail: order.customer_email,
      },
      payment: {
        paymentKey: pd.paymentKey ?? paymentKey,
        method,
        approvedAmount: isDone ? approvedAmount : 0,
        receiptUrl,
      },
      virtualAccount: pd.virtualAccount ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
