import Link from "next/link";
import type { EventInfo } from "@/lib/data/events";
import { BniBrandLogo } from "@/components/brand/BniBrandLogo";

/** 어두운 행사 화면에서 함께 쓰는 글자 모양 */
export const EVENT_DARK = {
  page: "bg-[#18181a] text-white",
  eyebrow: "text-xs font-bold uppercase tracking-[0.25em] text-white/50",
  title: "text-3xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl",
  /** 화면 가장자리 여백과 최대 폭. slush.org 의 본문 폭은 1280px. */
  wrap: "mx-auto w-full max-w-[1344px] px-5 sm:px-8",
  /**
   * 단추 두 가지 — slush.org 의 Platform / Buy tickets 단추에서 읽은 수치:
   * 128x40, 모서리 8px, 여백 10px 24px, 글자 16px, 테두리는 안쪽 1px 선(그림자).
   * 색만 BNI 붉은색으로 바꿨다(Slush 는 어두운 초록 바탕 + 초록 선).
   */
  btn: "inline-flex min-h-10 min-w-32 items-center justify-center rounded-lg bg-[#1f1f22] px-6 py-2.5 text-base font-semibold leading-5 text-white shadow-[inset_0_0_0_1px_rgba(161,161,166,0.3)] transition hover:shadow-[inset_0_0_0_1px_rgba(161,161,166,0.7)]",
  btnBuy:
    "inline-flex min-h-10 min-w-32 items-center justify-center rounded-lg bg-[#3a1a1e] px-6 py-2.5 text-base font-semibold leading-5 text-white shadow-[inset_0_0_0_1px_rgba(255,96,108,0.45)] transition hover:bg-[#5a1f26] hover:shadow-[inset_0_0_0_1px_rgba(255,96,108,0.9)]",
  btnOff:
    "inline-flex min-h-10 min-w-32 items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold leading-5 text-white/55 shadow-[inset_0_0_0_1px_rgba(161,161,166,0.25)]",
};

/** 길쭉한 제목 글꼴(Anton). 영문·숫자에만 적용된다. */
export const DISPLAY_FONT = { fontFamily: '"Anton", "Pretendard Variable", "Pretendard", sans-serif', fontWeight: 400 } as const;

export type EventPageKey = "home" | "speakers" | "info";

/**
 * 행사 화면 맨 위에 떠 있는 둥근 메뉴 바(스크롤해도 위에 붙어 있다).
 * slush.org 상단 바를 참고했다: 로고 + 날짜|도시 / 메뉴(각각 별도 페이지) / 테두리 단추 + 색 단추.
 * self = 행사 첫 화면 주소, query = 탭을 유지하기 위한 꼬리("" 또는 "?tab=international").
 */
export function EventSubnav({
  event,
  self,
  hub,
  query,
  intl,
  active,
  onSale,
  closedLabel,
}: {
  event: EventInfo;
  self: string;
  /** 행사 목록(허브 첫 화면) 주소 */
  hub: string;
  query: string;
  intl: boolean;
  active: EventPageKey;
  onSale: boolean;
  closedLabel: string;
}) {
  const t = (ko: string, en: string) => (intl ? en : ko);
  const hasSpeakers = (event.speakers?.length ?? 0) > 0;
  const hasInfo = (event.info?.length ?? 0) > 0;
  const item = (on: boolean) =>
    `text-base font-semibold transition ${on ? "text-white" : "text-white/80 hover:text-white"}`;
  const when = [event.dateShort, event.city].filter(Boolean).join(" | ");

  return (
    <div className="sticky top-3 z-30 sm:top-5">
      <div className={EVENT_DARK.wrap}>
        <div className="flex items-center gap-4 rounded-xl bg-[#18181a]/50 px-4 py-3 backdrop-blur-md sm:gap-6 sm:px-6">
          <Link href={`${self}${query}`} className="flex min-w-0 flex-1 items-center gap-3" aria-label={event.name}>
            <span className="flex-none rounded-lg bg-white px-2 py-1.5">
              <BniBrandLogo name="event" />
            </span>
            {when && (
              <span className="truncate text-lg uppercase leading-none tracking-wide sm:text-2xl" style={DISPLAY_FONT}>
                {when}
              </span>
            )}
          </Link>

          <nav className="hidden flex-none items-center gap-7 md:flex lg:gap-10" aria-label={t("행사 메뉴", "Event menu")}>
            <Link href={`${self}${query}`} className={item(active === "home")}>
              {event.year} Conference
            </Link>
            {hasSpeakers && (
              <Link href={`${self}/speakers${query}`} className={item(active === "speakers")}>
                Speakers
              </Link>
            )}
            <Link href={`${self}${query}#tickets`} className={item(false)}>
              Tickets
            </Link>
            {hasInfo && (
              <Link href={`${self}/info${query}`} className={item(active === "info")}>
                Event Info
              </Link>
            )}
          </nav>

          {/* 좁은 화면: 메뉴 대신 Speakers 만 */}
          {hasSpeakers && (
            <Link href={`${self}/speakers${query}`} className={`md:hidden ${item(active === "speakers")}`}>
              Speakers
            </Link>
          )}

          <Link href={hub} className={`hidden flex-none lg:inline-flex ${EVENT_DARK.btn}`}>
            {t("행사 목록", "All events")}
          </Link>
          {onSale ? (
            <Link href={`${self}${query}#tickets`} className={`flex-none ${EVENT_DARK.btnBuy}`}>
              {t("티켓 구매", "Buy tickets")}
            </Link>
          ) : (
            <span className={`flex-none ${EVENT_DARK.btnOff}`}>
              {closedLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** 아래 페이지 맨 위의 길 안내 칩: 「2026 Conference > Speakers」 (slush.org 아래 페이지 참고) */
export function EventCrumbs({ home, homeLabel, current }: { home: string; homeLabel: string; current: string }) {
  const chip = "rounded-lg px-3 py-1.5 text-sm font-semibold";
  return (
    <nav className="flex items-center gap-3 pt-14 sm:pt-20" aria-label="breadcrumb">
      <Link href={home} className={`${chip} bg-white/10 text-white/65 transition hover:text-white`}>
        {homeLabel}
      </Link>
      <span className="text-white/50">&gt;</span>
      <span className={`${chip} border border-white/40 text-white`}>{current}</span>
    </nav>
  );
}
