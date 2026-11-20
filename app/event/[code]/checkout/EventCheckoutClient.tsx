"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { audienceOf, eventPath, getEvent } from "@/lib/data/events";
import { won } from "@/lib/format";
import type { Customer, OrderRequest } from "@/lib/catalog";

// 행사(event.bnikorea.com)는 스토어와 MID 가 다르다. 행사용 키가 들어오기 전에는 스토어 키를 함께 쓴다.
const EVENT_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_EVENT_CLIENT_KEY || undefined;

export function EventCheckoutClient({
  eventCode,
  base,
  onSale,
}: {
  eventCode: string;
  base: string;
  onSale: boolean;
}) {
  const sp = useSearchParams();
  const event = getEvent(eventCode)!;
  const ticket = event.tickets.find((t) => t.id === (sp.get("ticket") ?? ""));

  if (!ticket) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">티켓을 찾을 수 없습니다</h1>
        <Link href={eventPath(base, `/${event.code}`)} className="font-semibold text-bni-red">
          행사 페이지로 돌아가기
        </Link>
      </main>
    );
  }

  const intl = audienceOf(ticket) === "international";
  const t = (ko: string, en: string) => (intl ? en : ko);
  const qty = Math.max(1, Math.min(ticket.maxQuantity, Number(sp.get("qty")) || 1));
  const total = ticket.price * qty;

  const makeRequest = (customer: Customer): OrderRequest => ({
    domain: "event",
    customer,
    eventCode: event.code,
    ticketId: ticket.id,
    quantity: qty,
  });

  const summary = (
    <section className="rounded-2xl border border-bni-line p-5">
      <h2 className="mb-4 text-lg font-bold">{t("주문 티켓", "Your order")}</h2>
      <p className="text-xs text-bni-body">{event.name}</p>
      <div className="mt-1 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold">{t(ticket.nameKo, ticket.name)}</h3>
          <p className="mt-1 text-sm text-bni-body">
            {t(`${qty}매 × ${won(ticket.price)}`, `${qty} × ${won(ticket.price)}`)}
          </p>
        </div>
        <div className="flex-none font-bold">{won(total)}</div>
      </div>
      <dl className="mt-4 grid gap-1.5 border-t border-bni-line pt-4 text-sm">
        <div className="flex justify-between text-base font-extrabold">
          <dt>{t("총 결제금액", "Total (KRW)")}</dt>
          <dd className="text-bni-red">{won(total)}</dd>
        </div>
      </dl>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-2xl font-extrabold">{t("주문 / 결제", "Checkout")}</h1>
      <CheckoutPanel
        makeRequest={makeRequest}
        amount={total}
        summary={summary}
        eventAudience={audienceOf(ticket)}
        tossClientKey={EVENT_CLIENT_KEY}
        disabledReason={onSale ? undefined : t("판매가 종료된 행사입니다", "Sales have ended")}
      />
    </main>
  );
}
