"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTraining } from "@/lib/data/trainings";
import { won } from "@/lib/format";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import type { Customer, OrderRequest } from "@/lib/catalog";

export function TrainingCheckoutClient() {
  const sp = useSearchParams();
  const trainingId = sp.get("trainingId") ?? "";
  const t = getTraining(trainingId);

  if (!t) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">트레이닝을 찾을 수 없습니다</h1>
        <Link href="/training" className="font-semibold text-bni-red">트레이닝으로 돌아가기</Link>
      </main>
    );
  }

  const makeRequest = (customer: Customer): OrderRequest => ({
    domain: "training",
    customer,
    trainingId: t.id,
  });

  const summary = (
    <section className="rounded-2xl border border-bni-line p-5">
      <h2 className="mb-4 text-lg font-bold">수강 신청</h2>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between"><dt className="text-bni-body">과정</dt><dd className="font-semibold">{t.title}</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">챕터/강사</dt><dd>{t.chapter} · {t.who}</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">일시</dt><dd>{t.date} {t.time}</dd></div>
        <div className="mt-2 flex justify-between border-t border-bni-line pt-3 text-base font-extrabold"><dt>수강료</dt><dd className="text-bni-red">{won(t.price)}</dd></div>
      </dl>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-2xl font-extrabold">수강 신청 / 결제</h1>
      <CheckoutPanel makeRequest={makeRequest} amount={t.price} summary={summary} />
    </main>
  );
}
