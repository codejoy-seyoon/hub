import { Suspense } from "react";
import { EbookCheckoutClient } from "./EbookCheckoutClient";

export const metadata = { title: "구매/결제 | BNI 이북" };

export default function EbookCheckoutPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-12" />}>
      <EbookCheckoutClient />
    </Suspense>
  );
}
