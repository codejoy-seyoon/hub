import { Suspense } from "react";
import { TrainingCheckoutClient } from "./TrainingCheckoutClient";

export const metadata = { title: "수강 신청/결제 | BNI 트레이닝" };

export default function TrainingCheckoutPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-12" />}>
      <TrainingCheckoutClient />
    </Suspense>
  );
}
