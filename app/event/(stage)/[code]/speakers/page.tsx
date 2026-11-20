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
} from "@/lib/data/events";
import { EVENT_DARK, EventCrumbs, EventSubnav } from "@/components/event/EventSubnav";
import { ScrollTopOnMount } from "@/components/event/ScrollTopOnMount";

// 연사 라인업 — 행사 첫 화면과 따로 있는 페이지.
// slush.org 의 Speakers 페이지를 따랐다(사용자 캡처 2026-11-20 200759):
//   길 안내 칩 → 「2026 SPEAKER LINEUP」(연도는 흐리게) + 한 줄 설명, 오른쪽에 테두리 단추
//   → 사진 카드 4칸 격자(홀·짝 칸이 위아래로 엇갈림), 사진 아래 오른쪽 정렬로 이름·직함·소속.
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const event = getEvent(code);
  return { title: event ? `Speakers | ${event.name}` : "BNI Event" };
}

export default async function EventSpeakersPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { code } = await params;
  const { tab } = await searchParams;
  const event = getEvent(code);
  if (!event || (event.speakers?.length ?? 0) === 0) notFound();

  const base = eventBaseFromHost((await headers()).get("host"));
  const hasIntl = event.tickets.some((x) => audienceOf(x) === "international");
  const intl = hasIntl && tab === "international";
  const t = (ko: string, en: string) => (intl ? en : ko);
  const onSale = isOnSale(event);
  const label = onSale
    ? EVENT_STATUS_LABEL.on_sale
    : EVENT_STATUS_LABEL[event.status === "on_sale" ? "sold_out" : event.status];
  const self = eventPath(base, `/${event.code}`);
  const query = intl ? "?tab=international" : "";
  // 날짜 구분 없이 한 격자로(참고 화면과 같이). 순서는 자료에 적힌 순서.
  const speakers = event.speakers!.flatMap((d) => d.speakers);

  return (
    <div className={EVENT_DARK.page}>
      <ScrollTopOnMount />
      <EventSubnav
        event={event}
        self={self}
        hub={eventPath(base)}
        query={query}
        intl={intl}
        active="speakers"
        onSale={onSale}
        closedLabel={intl ? label.en : label.ko}
      />

      <main className={EVENT_DARK.wrap}>
        <EventCrumbs home={`${self}${query}`} homeLabel={`${event.year} Conference`} current="Speakers" />

        <header className="flex flex-wrap items-start justify-between gap-6 pt-10">
          <div>
            <h1 className="text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
              <span className="font-medium text-white/50">{event.year}</span> Speaker lineup
            </h1>
            <p className="mt-4 text-lg font-semibold text-white/85">
              {t(
                `${event.nameKo}를 빛내줄 연사들을 소개합니다.`,
                `Meet our speakers coming to the ${event.name}.`,
              )}
            </p>
          </div>
          <Link href={eventPath(base)} className={`flex-none ${EVENT_DARK.btn}`}>
            {t("지난 행사", "Past events")}
          </Link>
        </header>

        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 pb-10 pt-16 sm:gap-x-8 lg:grid-cols-4 lg:pt-20">
          {speakers.map((sp, i) => (
            <li
              key={sp.role + sp.name}
              // 짝수 칸(2·4번째)은 조금 내려서 엇갈리게 한다
              className={i % 2 === 1 ? "pt-10 lg:pt-12" : ""}
              title={sp.title}
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-white/[0.06]">
                {sp.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sp.photo}
                    alt={sp.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top grayscale transition duration-500 hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-center text-3xl font-extrabold uppercase leading-tight text-white/35">
                    {sp.name}
                  </div>
                )}
              </div>
              <div className="mt-4 text-right">
                <p className="text-lg font-extrabold leading-snug sm:text-xl">{sp.name}</p>
                <p className="mt-1 text-sm leading-5 text-white/70">{sp.org}</p>
                <p className="mt-1 text-sm font-bold text-white/90">{sp.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <section className="mb-20 mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:flex-row sm:items-center sm:p-10">
          <h2 className={EVENT_DARK.title}>
            {intl ? (
              <>
                <span className="text-white/45">Grab your</span> ticket now
              </>
            ) : (
              <>
                <span className="text-white/45">현장에서</span> 직접 만나보세요
              </>
            )}
          </h2>
          {onSale ? (
            <Link href={`${self}${query}#tickets`} className={`flex-none ${EVENT_DARK.btnBuy} min-h-[43px]`}>
              {t("티켓 구매하기", "Buy tickets")}
            </Link>
          ) : (
            <Link href={`${self}${query}`} className={`flex-none ${EVENT_DARK.btn} min-h-[43px]`}>
              {t("행사 첫 화면으로", "Back to event")}
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}
