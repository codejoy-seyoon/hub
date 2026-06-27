import { Suspense } from "react";
import { SuccessClient } from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-5 py-16">
          <p className="text-bni-body">결제 정보를 확인하는 중…</p>
        </main>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
