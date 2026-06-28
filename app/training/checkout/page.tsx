import { Suspense } from "react";
import { TrainingCheckoutClient } from "./TrainingCheckoutClient";
import { HubShell } from "@/components/HubShell";

export const metadata = { title: "수강 신청/결제 | BNI 트레이닝" };

export default function TrainingCheckoutPage() {
  return (
    <HubShell>
      <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-12" />}>
        <TrainingCheckoutClient />
      </Suspense>
    </HubShell>
  );
}
