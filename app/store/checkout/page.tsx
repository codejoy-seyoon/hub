import { Suspense } from "react";
import { StoreCheckoutClient } from "./StoreCheckoutClient";

export const metadata = { title: "주문/결제 | BNI KOREA STORE" };

export default function StoreCheckoutPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-12" />}>
      <StoreCheckoutClient />
    </Suspense>
  );
}
