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
  isOnSale,
  type EventAudience,
} from "@/lib/data/events";
import { money } from "@/lib/format";
import { EventCountdown } from "@/components/event/EventCountdown";
import { DISPLAY_FONT, EVENT_DARK, EventSubnav } from "@/components/event/EventSubnav";

// 행사 한 개의 첫 화면(인덱스).
// slush.org 첫 화면을 장면 단위로 따랐다(사용자 캡처 3장, 2026-11-20):
//   ① 화면 가득한 첫 장면 — 떠 있는 메뉴 바, 가운데 두 줄 문구(둘째 줄은 오른쪽), 왼쪽 아래 작은 숫자, 오른쪽 아래 구매 단추
//   ② 남은 시간 판 — 둥근 검은 판, 행사명·날짜, 큰 숫자 + 작은 단위
//   ③ 티켓 — 「GRAB YOUR / TICKET NOW」, 세로로 긴 카드(티켓마다 다른 색 빛), 길쭉한 큰 이름, 가격, 반투명 속판, 상태 띠
//   ④ 가운데 정렬 소개 문구 → 바로가기 카드(연사는 별도 페이지) → 질문
// 색과 로고는 BNI 것이고, 내용은 lib/data/events.ts 에 있는 것만 보여 준다.

// 티켓 카드의 빛 색(순서대로 돌려 쓴다): 붉은색 · 분홍 · 주황 · 파랑 · 초록
const GLOW = [
  ["#e11b2b", "#ff5a66"],
  ["#d6247f", "#ff7ac0"],
  ["#e2571a", "#ffb37a"],
  ["#2b3fe0", "#8fa0ff"],
  ["#1fae4b", "#8dffab"],
];

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
  const query = intl ? "?tab=international" : "";
  const hasSpeakers = (event.speakers?.length ?? 0) > 0;
  const speakerCount = (event.speakers ?? []).reduce((n, d) => n + d.speakers.length, 0);

  // 첫 장면 문구 두 줄. 줄마다 [흐리게, 밝게, 흐리게] — 가운데 낱말만 굵고 밝다.
  //   1줄: 행사 이름 (앞부분 흐리게 + 뒤 두 낱말 밝게)
  //   2줄: 표어 (가운데 낱말 밝게). 표어가 없으면 한 줄만.
  const nameWords = event.name.split(" ");
  const nameCut = Math.max(1, nameWords.length - 2);
  const line1: [string, string, string] = [nameWords.slice(0, nameCut).join(" "), nameWords.slice(nameCut).join(" "), ""];
  const tagWords = (event.tagline ?? "").split(" ").filter(Boolean);
  const line2: [string, string, string] | null =
    tagWords.length >= 3
      ? [tagWords.slice(0, 1).join(" "), tagWords.slice(1, -2).join(" ") || tagWords[1], tagWords.slice(-2).join(" ")]
      : tagWords.length
        ? ["", tagWords.join(" "), ""]
        : null;

  const stats = [
    ...(event.stats ?? []),
    ...(hasSpeakers ? [{ value: `${speakerCount}`, label: { ko: "SESSIONS", en: "SESSIONS" } }] : []),
    { value: String(tickets.length), label: { ko: "PASSES", en: "PASSES" } },
  ];

  const { wrap } = EVENT_DARK;
  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg py-3 text-center text-base font-semibold transition ${
      active ? "bg-white text-[#18181a]" : "text-white/60 hover:text-white"
    }`;
  const bigTitle = "text-5xl font-extrabold uppercase leading-[1.08] tracking-tight sm:text-7xl";
  const card =
    "group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition hover:border-white/40";
  // slush.org 「Buy tickets now」: 151x43, 모서리 8px
  const buyTint = `${EVENT_DARK.btnBuy} min-h-[43px]`;

  return (
    <div className={EVENT_DARK.page}>
      {/* ① 화면 가득한 첫 장면 */}
      <div className="relative isolate">
        {/* 배경: 영상(slush.org 첫 장면처럼). 영상이 없거나 아직 안 떴을 때는 아래에 그린 붉은 빛줄기가 보인다. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          style={{
            background:
              "radial-gradient(55% 45% at 58% 34%, rgba(207,32,48,0.55) 0%, rgba(120,12,22,0.28) 45%, transparent 75%)," +
              "radial-gradient(40% 30% at 30% 78%, rgba(207,32,48,0.22) 0%, transparent 70%)," +
              "linear-gradient(112deg, transparent 31%, rgba(225,27,43,0.55) 33.2%, rgba(225,27,43,0.12) 35%, transparent 37%)," +
              "linear-gradient(180deg, #0b0b0c 0%, #121214 55%, #18181a 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "repeating-linear-gradient(8deg, transparent 0 34px, rgba(255,120,130,0.07) 34px 36px, transparent 36px 78px)",
              maskImage: "radial-gradient(60% 45% at 58% 36%, #000 0%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(60% 45% at 58% 36%, #000 0%, transparent 78%)",
            }}
          />
          {event.heroVideo && (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={event.heroVideo} type="video/mp4" />
              </video>
              {/* 영상에 붉은 기운을 입힌다(BNI 색). */}
              <div className="absolute inset-0 bg-[#b0101f] mix-blend-multiply" />
              <div className="absolute inset-0 bg-[#e11b2b]/15 mix-blend-screen" />
              {/* 글자가 읽히도록 영상을 어둡게 누르고, 아래쪽은 본문 바탕색으로 이어 준다 */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,10,11,0.7) 0%, rgba(14,14,16,0.42) 40%, rgba(18,18,20,0.7) 78%, #18181a 100%)",
                }}
              />
            </>
          )}
        </div>

        <EventSubnav
          event={event}
          self={self}
          hub={eventPath(base)}
          query={query}
          intl={intl}
          active="home"
          onSale={onSale}
          closedLabel={intl ? label.en : label.ko}
        />

        <section className={`${wrap} flex min-h-[calc(100svh-5.5rem)] flex-col`}>
          <h1 className="my-auto py-16 text-3xl uppercase leading-[1.28] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block">
              {line1[0] && <span className="font-medium text-white/55">{line1[0]} </span>}
              <span className="font-extrabold">{line1[1]}</span>
            </span>
            {line2 && (
              <span className="block sm:text-right">
                {line2[0] && <span className="font-medium text-white/55">{line2[0]} </span>}
                <span className="font-extrabold">{line2[1]}</span>
                {line2[2] && <span className="font-medium text-white/55"> {line2[2]}</span>}
              </span>
            )}
          </h1>

          <div className="flex flex-wrap items-end justify-between gap-8 pb-10 sm:pb-14">
            <dl className="flex flex-wrap gap-x-10 gap-y-6">
              {stats.map((s) => (
                <div key={s.value + s.label.en}>
                  <dd className="text-2xl font-black uppercase tracking-wide text-white/90 sm:text-3xl">{s.value}</dd>
                  <dt className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/50 sm:text-sm">
                    {t(s.label.ko, s.label.en)}
                  </dt>
                </div>
              ))}
            </dl>
            {onSale ? (
              <a href="#tickets" className={buyTint}>
                {t("지금 티켓 구매하기", "Buy tickets now")}
              </a>
            ) : (
              <span className={`${EVENT_DARK.btnOff} min-h-[43px]`}>
                {intl ? label.en : label.ko}
              </span>
            )}
          </div>
        </section>
      </div>

      <main className={wrap}>
        {/* ② 남은 시간 판 */}
        {event.startsAt && (
          <section id="info" className="scroll-mt-28 pt-20 sm:pt-28">
            <EventCountdown
              startsAt={event.startsAt}
              caption={[event.name, event.dateShort, event.venue ? t(event.venue.ko, event.venue.en) : null]
                .filter(Boolean)
                .join(" · ")}
            />
          </section>
        )}

        {/* ③ 티켓 */}
        <section className="pt-28 sm:pt-40">
          {/* "Buy tickets" lands on this title: the whole title, the tabs, the card row and the payment line fit on one screen. */}
          <h2
            id="tickets"
            className={`${bigTitle} scroll-mt-8 bg-gradient-to-r from-white/45 to-white/85 bg-clip-text text-transparent sm:scroll-mt-10`}
          >
            {intl ? (
              <>
                Grab your
                <br />
                ticket now
              </>
            ) : (
              <>
                Grab your
                <br />
                ticket now
              </>
            )}
          </h2>

          {hasIntl && (
            <nav
              className="mt-10 flex w-full gap-1 rounded-xl bg-[#1f1f22] p-1 shadow-[inset_0_0_0_1px_rgba(161,161,166,0.3)]"
              aria-label="참가자 구분"
            >
              <Link href={`${self}#tickets`} className={tabClass(!intl)} scroll={false}>
                국내 참가자
              </Link>
              <Link href={`${self}?tab=international#tickets`} className={tabClass(intl)} scroll={false}>
                International
              </Link>
            </nav>
          )}
          {intl && (
            <p className="mt-4 text-xs text-white/50">
              Prices are in USD and charged in USD. International cards (Visa, Mastercard, JCB, AMEX) are accepted.
            </p>
          )}

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tickets.map((x, i) => {
              const [c1, c2] = GLOW[i % GLOW.length];
              const detail = eventPath(base, `/${event.code}/${x.id}`);
              const tier = x.tier ?? x.name;
              return (
                <li
                  key={x.id}
                  className="relative isolate flex min-h-[34rem] flex-col overflow-hidden rounded-3xl bg-black px-6 py-7"
                >
                  {/* 빛 번짐 */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10"
                    style={{
                      background:
                        `radial-gradient(70% 38% at 18% 8%, ${c1} 0%, transparent 70%),` +
                        `radial-gradient(60% 36% at 96% 92%, ${c2} 0%, transparent 72%),` +
                        `linear-gradient(140deg, ${c1}66 0%, transparent 42%, transparent 62%, ${c1}88 100%)`,
                    }}
                  />
                  <h3
                    className="flex min-h-[5.2rem] items-end justify-center text-center text-[2.6rem] uppercase leading-[0.95] sm:text-5xl"
                    style={DISPLAY_FONT}
                  >
                    {tier}
                  </h3>
                  <p className="mt-3 flex items-center gap-3 text-xl font-black tracking-wide">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/70" />
                    {money(x.price, currencyOf(x))}
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/70" />
                  </p>

                  <div className="mt-5 flex flex-1 flex-col justify-center rounded-2xl border border-white/35 bg-white/10 p-4 backdrop-blur-sm">
                    <ul className="grid gap-3 text-[15px] leading-snug">
                      {(x.features ?? []).map((f) => (
                        <li key={f.en} className={`font-semibold ${f.ok === false ? "text-white/40 line-through" : ""}`}>
                          {t(f.ko, f.en)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-white/20 pt-3 text-[11px] leading-4 text-white/65">
                      {t(x.nameKo, x.name)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {onSale ? (
                      <Link
                        href={eventPath(base, `/${event.code}/checkout?ticket=${x.id}&qty=1`)}
                        className="flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/15 px-4 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                      >
                        {t("구매하기", "Buy ticket")}
                      </Link>
                    ) : (
                      <span className="flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-base font-medium text-white/50">
                        {intl ? label.en : label.ko}
                      </span>
                    )}
                    {x.image && (
                      <Link href={detail} className="block py-1 text-center text-[11px] font-bold text-white/70 hover:text-white">
                        {t("상세 보기", "View details")}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-xs text-white/50">
            {(intl ? ["VISA", "Mastercard", "JCB", "AMEX"] : ["신용/체크카드", "간편결제", "계좌이체", "가상계좌"]).join(" · ")}
          </p>
        </section>

        {/* ④ 가운데 정렬 소개 문구 + 항목 */}
        {(event.highlights?.length ?? 0) > 0 && (
          <section className="pt-28 text-center sm:pt-40">
            <h2 className="text-3xl uppercase leading-[1.3] tracking-tight sm:text-5xl">
              {intl ? (
                <>
                  <span className="font-medium text-white/55">This is what </span>
                  <span className="font-extrabold">you will</span>
                  <br />
                  <span className="font-medium text-white/55">experience </span>
                  <span className="font-extrabold">in two days</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-white/55">이틀 동안 </span>
                  <span className="font-extrabold">이런 경험을</span>
                  <br />
                  <span className="font-medium text-white/55">현장에서 </span>
                  <span className="font-extrabold">하게 됩니다</span>
                </>
              )}
            </h2>
            <ul className="mx-auto mt-14 grid max-w-5xl gap-x-12 gap-y-10 text-left sm:grid-cols-2">
              {event.highlights!.map((h, i) => (
                <li key={h.en} className="flex gap-5 border-t border-white/15 pt-6">
                  <span className="text-3xl leading-none text-bni-red" style={DISPLAY_FONT}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold leading-snug">{t(h.ko, h.en)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ⑤ 바로가기 카드 — 각 항목은 별도 페이지로 넘어간다 */}
        <section className="grid gap-5 pt-28 sm:grid-cols-2 sm:pt-40">
          {hasSpeakers && (
            <Link href={`${self}/speakers${query}`} className={`${card} min-h-72 sm:col-span-2`}>
              <p className={EVENT_DARK.eyebrow}>{event.year} speaker lineup</p>
              <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
                <h2 className={bigTitle}>
                  <span className="text-white/45">Meet the</span>
                  <br />
                  speakers
                </h2>
                <span className={`flex-none ${EVENT_DARK.btn} group-hover:bg-white group-hover:text-[#18181a]`}>
                  {t("연사 보기 →", "View lineup →")}
                </span>
              </div>
              <p className="mt-6 text-white/60">
                {t(
                  `${event.nameKo}를 빛내줄 연사 ${speakerCount}개 세션을 소개합니다.`,
                  `${speakerCount} sessions across ${event.speakers!.length} days.`,
                )}
              </p>
            </Link>
          )}
          <a href="#tickets" className={card}>
            <p className={EVENT_DARK.eyebrow}>Tickets</p>
            <h2 className="mt-10 text-3xl font-extrabold uppercase tracking-tight">{t("티켓 선택하기", "Choose your pass")}</h2>
            <p className="mt-3 text-white/60">
              {tickets.length} {t("가지 티켓 · 국내 참가자 / International", "pass options")}
            </p>
          </a>
          <Link href={eventPath(base)} className={card}>
            <p className={EVENT_DARK.eyebrow}>All events</p>
            <h2 className="mt-10 text-3xl font-extrabold uppercase tracking-tight">
              {t("다른 행사 · 지난 행사", "Other & past events")}
            </h2>
            <p className="mt-3 text-white/60">BNI Korea Events</p>
          </Link>
        </section>

        {/* ⑥ 자주 묻는 질문 */}
        {(event.faq?.length ?? 0) > 0 && (
          <section className="pb-28 pt-28 sm:pt-40">
            <h2 className={`${bigTitle} bg-gradient-to-r from-white/45 to-white/85 bg-clip-text text-transparent`}>
              {intl ? (
                <>
                  More about
                  <br />
                  the conference
                </>
              ) : (
                <>
                  More about
                  <br />
                  the conference
                </>
              )}
            </h2>
            <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {event.faq!.map((f) => (
                <details key={f.q.en} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-lg font-extrabold uppercase tracking-tight sm:text-2xl">
                    {t(f.q.ko, f.q.en)}
                    <span className="flex-none text-sm font-semibold text-white/50 group-open:hidden">Expand +</span>
                    <span className="hidden flex-none text-sm font-semibold text-white/50 group-open:inline">Close −</span>
                  </summary>
                  <p className="max-w-3xl pb-8 text-lg leading-8 text-white/70">{t(f.a.ko, f.a.en)}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
