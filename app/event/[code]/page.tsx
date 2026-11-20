import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  EVENT_STATUS_LABEL,
  audienceOf,
  eventBaseFromHost,
  eventPath,
  getEvent,
  isOnSale,
  type EventAudience,
} from "@/lib/data/events";
import { won } from "@/lib/format";

// 행사 한 개의 페이지(랜딩페이지 자리). 지금은 티켓 선택만 있고,
// 행사 소개·일정·연사 등 본문은 행사별로 이 자리에 채운다.
// 티켓은 지난해 사이트(nc26 티켓 페이지)처럼 「국내 참가자 / International」 탭으로 나눈다.
export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { code } = await params;
  const { tab } = await searchParams;
  const event = getEvent(code);
  if (!event) notFound();

  const base = eventBaseFromHost((await headers()).get("host"));
  const onSale = isOnSale(event);
  const label = onSale
    ? EVENT_STATUS_LABEL.on_sale
    : EVENT_STATUS_LABEL[event.status === "on_sale" ? "sold_out" : event.status];

  const hasIntl = event.tickets.some((t) => audienceOf(t) === "international");
  const audience: EventAudience = hasIntl && tab === "international" ? "international" : "domestic";
  const intl = audience === "international";
  const t = (ko: string, en: string) => (intl ? en : ko);
  const tickets = event.tickets.filter((x) => audienceOf(x) === audience);
  const self = eventPath(base, `/${event.code}`);

  const tabClass = (active: boolean) =>
    `flex-1 rounded-xl py-3 text-center text-sm font-bold transition ${
      active ? "bg-bni-ink text-white" : "text-bni-body hover:text-bni-ink"
    }`;

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="text-center">
        <span className="rounded-full bg-bni-red-soft px-3 py-1 text-xs font-bold text-bni-red-dark">
          {label.ko} · {label.en}
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {intl ? (
            <>Choose Your <span className="text-bni-red">Experience</span></>
          ) : (
            <>어떤 <span className="text-bni-red">경험</span>으로 함께 하시겠습니까?</>
          )}
        </h1>
        <p className="mt-3 text-bni-body">{t(event.nameKo, event.name)}</p>
      </div>

      {hasIntl && (
        <nav className="mx-auto mt-10 flex max-w-xl gap-1 rounded-2xl border border-bni-line bg-bni-soft p-1" aria-label="참가자 구분">
          <Link href={self} className={tabClass(!intl)} scroll={false}>
            국내 참가자
          </Link>
          <Link href={`${self}?tab=international`} className={tabClass(intl)} scroll={false}>
            International
          </Link>
        </nav>
      )}

      {intl && (
        <p className="mx-auto mt-4 max-w-xl text-center text-xs text-bni-body">
          Prices are in KRW and charged in KRW. Your card issuer converts the amount to your currency.
        </p>
      )}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {tickets.map((x) => (
          <li key={x.id} className="flex flex-col rounded-2xl border border-bni-line p-6">
            <h2 className="text-xl font-extrabold">{t(x.nameKo, x.name)}</h2>
            {x.summary && <p className="mt-1 text-sm text-bni-body">{t(x.summary.ko, x.summary.en)}</p>}

            <div className="mt-5 flex items-center justify-between rounded-xl bg-bni-soft px-4 py-3">
              <span className="text-xs font-bold text-bni-body">{t("정상가", "REGULAR")}</span>
              <span className="text-2xl font-extrabold text-bni-red">{won(x.price)}</span>
            </div>

            <ul className="mt-5 grid gap-2.5 text-sm">
              {(x.features ?? []).map((f) => (
                <li key={f.en} className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[18px] ${f.ok === false ? "text-bni-body" : "text-emerald-600"}`}
                    aria-hidden
                  >
                    {f.ok === false ? "cancel" : "check_circle"}
                  </span>
                  {t(f.ko, f.en)}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              {onSale ? (
                <Link
                  href={eventPath(base, `/${event.code}/checkout?ticket=${x.id}&qty=1`)}
                  className="block rounded-xl bg-bni-red py-3.5 text-center text-sm font-bold text-white transition hover:bg-bni-red-strong"
                >
                  {t("구매하기", "Buy Ticket")}
                </Link>
              ) : (
                <span className="block rounded-xl bg-bni-soft py-3.5 text-center text-sm font-bold text-bni-body">
                  {intl ? label.en : label.ko}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-12 text-center">
        <h2 className="text-xs font-bold tracking-widest text-bni-body">
          {t("결제 수단", "SECURE PAYMENT")}
        </h2>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold">
          {(intl
            ? ["VISA", "Mastercard", "JCB", "AMEX"]
            : ["신용/체크카드", "계좌이체", "가상계좌"]
          ).map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-bni-red" aria-hidden>
                credit_card
              </span>
              {m}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
