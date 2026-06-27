import { NextResponse } from "next/server";
import { getOrdersByPhone } from "@/lib/orderStore";

export const runtime = "nodejs";

/** GET /api/lookup?phone=01012345678 — 전화번호로 내 주문/예약/수강/구매 조회 (예시 번호는 형식 안내용) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") ?? "";
  if (!phone.replace(/\D/g, "")) {
    return NextResponse.json({ message: "전화번호를 입력하세요." }, { status: 400 });
  }
  const orders = await getOrdersByPhone(phone);
  return NextResponse.json({ orders });
}
