import { NextResponse } from "next/server";

// 임시 진단용: 환경변수 존재/형식만 노출(값 자체는 노출하지 않음). 확인 후 삭제.
export const dynamic = "force-dynamic";

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const svc = process.env.SUPABASE_STORE_JWT ?? "";
  const tossPk = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";
  const tossSk = process.env.TOSS_SECRET_KEY ?? "";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const desc = (v: string) => ({
    present: v.length > 0,
    length: v.length,
    head: v.slice(0, 8),
  });

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: { ...desc(url), startsWithHttp: url.startsWith("http") },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: desc(anon),
    // 값의 앞부분도 내보내지 않는다(있음/없음과 길이만)
    SUPABASE_STORE_JWT: { present: svc.length > 0, length: svc.length },
    NEXT_PUBLIC_TOSS_CLIENT_KEY: desc(tossPk),
    TOSS_SECRET_KEY: desc(tossSk),
    NEXT_PUBLIC_SITE_URL: desc(site),
  });
}
