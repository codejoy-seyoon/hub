import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  EVENT_STATUS_LABEL,
  audienceOf,
  currencyOf,
  eventBaseFromHost,
  eventPath,
  getEvent,
  getTicket,
  isOnSale,
} from "@/lib/data/events";
import { money } from "@/lib/format";

// 티켓 한 개의 상세페이지. 스토어의 상품 상세와 같은 자리다.
// 대표 이미지·상품명·가격·구매 단추, 그 아래 상세 이미지를 보여 준다.
export async function generateMetadata({ params }: { params: Promise<{ code: string; ticket: string }> }) {
  const { code, ticket } = await params;
  const item = getTicket(code, ticket);
  return { title: item ? `${item.name} | BNI Event` : "BNI Event" };
}

export default async function EventTicketPage({
  params,
}: {
  params: Promise<{ code: string; ticket: string }>;
}) {
  const { code, ticket: ticketId } = await params;
  const event = getEvent(code);
  const ticket = event ? getTicket(code, ticketId) : undefined;
  if (!event || !ticket) notFound();

  const base = eventBaseFromHost((await headers()).get("host"));
  const intl = audienceOf(ticket) === "international";
  const t = (ko: string, en: string) => (intl ? en : ko);
  const onSale = isOnSale(event);
  const label = onSale
    ? EVENT_STATUS_LABEL.on_sale
    : EVENT_STATUS_LABEL[event.status === "on_sale" ? "sold_out" : event.status];
  const back = eventPath(base, `/${event.code}`) + (intl ? "?tab=international" : "");
  const methods = intl
    ? ["VISA", "Mastercard", "JCB", "AMEX"]
    : ["신용/체크카드", "간편결제", "계좌이체", "가상계좌"];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <nav className="text-sm text-bni-body" aria-label="breadcrumb">
        <Link href={back} className="hover:text-bni-ink">
          {t(event.nameKo, event.name)}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("국내 참가자", "International")}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-bni-line bg-bni-soft">
          {ticket.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ticket.image} alt={ticket.name} className="w-full" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="self-start rounded-full bg-bni-red-soft px-3 py-1 text-xs font-bold text-bni-red-dark">
            {intl ? label.en : label.ko}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {t(ticket.nameKo, ticket.name)}
          </h1>

          <dl className="mt-6 grid gap-3 border-y border-bni-line py-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="font-bold text-bni-body">{t("판매가", "Price")}</dt>
              <dd className="text-2xl font-extrabold text-bni-red">{money(ticket.price, currencyOf(ticket))}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-bold text-bni-body">{t("결제 통화", "Currency")}</dt>
              <dd className="font-semibold">{currencyOf(ticket)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="flex-none font-bold text-bni-body">{t("결제 수단", "Payment")}</dt>
              <dd className="text-right font-semibold">{methods.join(" · ")}</dd>
            </div>
            {ticket.sku && (
              <div className="flex items-center justify-between">
                <dt className="font-bold text-bni-body">{t("상품코드", "Product code")}</dt>
                <dd className="font-semibold">{ticket.sku}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            {onSale ? (
              <Link
                href={eventPath(base, `/${event.code}/checkout?ticket=${ticket.id}&qty=1`)}
                className="block rounded-xl bg-bni-red py-4 text-center text-base font-bold text-white transition hover:bg-bni-red-strong"
              >
                {t("구매하기", "Buy Ticket")}
              </Link>
            ) : (
              <span className="block rounded-xl bg-bni-soft py-4 text-center text-base font-bold text-bni-body">
                {intl ? label.en : label.ko}
              </span>
            )}
          </div>
        </div>
      </div>

      {(ticket.detailImages?.length ?? 0) > 0 && (
        <section className="mt-12">
          <h2 className="border-b border-bni-line pb-3 text-lg font-extrabold">
            {t("상품 상세", "Product Details")}
          </h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-0">
            {ticket.detailImages!.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={ticket.name} className="w-full" loading="lazy" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
