import { NextResponse } from "next/server";
import { getBusy } from "@/lib/orderStore";

export const runtime = "nodejs";

/**
 * 특정 공간/날짜의 확정 예약을 busy 구간으로 반환.
 * GET /api/reservations/busy?spaceId=sp1&date=2026-06-15
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId");
  const date = searchParams.get("date");
  if (!spaceId || !date) {
    return NextResponse.json({ message: "spaceId, date 가 필요합니다." }, { status: 400 });
  }
  try {
    const busy = await getBusy(spaceId, date);
    return NextResponse.json({ busy });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ busy: [] });
  }
}
