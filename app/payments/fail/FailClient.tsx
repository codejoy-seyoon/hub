"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function FailClient() {
  const sp = useSearchParams();
  const code = sp.get("code");
  const message = sp.get("message");
  const orderId = sp.get("orderId");

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="mb-3 text-2xl font-extrabold">결제가 완료되지 않았습니다</h1>
      <div className="mb-6 space-y-1 rounded-2xl bg-red-50 px-5 py-4 text-red-800">
        <div><strong>code:</strong> {code ?? "-"}</div>
        <div><strong>message:</strong> {message ?? "-"}</div>
        <div><strong>orderId:</strong> {orderId ?? "-"}</div>
      </div>
      <Link href="/" className="font-semibold text-bni-red">홈으로 돌아가기</Link>
    </main>
  );
}
