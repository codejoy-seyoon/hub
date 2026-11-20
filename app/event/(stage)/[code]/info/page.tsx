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

// Event Info — 행사에 올 때 알아야 할 것을 모은 페이지.
// slush.org 의 Event Info 페이지를 따랐다(사용자 캡처 2026-11-20 200822):
//   길 안내 칩 → 「EVENT INFO」 + 짧은 안내 → 왼쪽에 붙어 있는 「Scroll to」 목차,
//   오른쪽에 구역(첫 낱말 굵게)마다 둥근 테두리의 접었다 펴는 줄 → 아래 문의 띠.
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const event = getEvent(code);
  return { title: event ? `Event Info | ${event.name}` : "BNI Event" };
}

export default async function EventInfoPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { code } = await params;
  const { tab } = await searchParams;
  const event = getEvent(code);
  if (!event || (event.info?.length ?? 0) === 0) notFound();

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
  const sections = event.info!;

  // 구역 제목: 첫 낱말은 굵게, 나머지는 가볍게
  const split = (s: string): [string, string] => {
    const i = s.indexOf(" ");
    return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i)];
  };

  return (
    <div className={EVENT_DARK.page}>
      <ScrollTopOnMount />
      <EventSubnav
        event={event}
        self={self}
        hub={eventPath(base)}
        query={query}
        intl={intl}
        active="info"
        onSale={onSale}
        closedLabel={intl ? label.en : label.ko}
      />

      <main className={EVENT_DARK.wrap}>
        <EventCrumbs home={`${self}${query}`} homeLabel={`${event.year} Conference`} current="Event Info" />

        <header className="pt-10">
          <h1 className="text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">Event info</h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
            {t(
              `${event.nameKo}에 오실 때 알아 두실 내용을 모았습니다.`,
              `Here are all the practicalities you need to know about the ${event.name}.`,
            )}{" "}
            {onSale && (
              <Link href={`${self}${query}#tickets`} className="text-bni-red underline-offset-4 hover:underline">
                {t("티켓 보기", "See tickets")}
              </Link>
            )}
          </p>
        </header>

        <div className="grid gap-x-16 gap-y-10 pb-24 pt-16 lg:grid-cols-[13rem_1fr] lg:pt-24">
          {/* 왼쪽 목차 (넓은 화면에서는 따라온다) */}
          <aside className="lg:sticky lg:top-36 lg:self-start">
            <p className="text-sm font-semibold text-white/55">Scroll to</p>
            <ul className="mt-5 flex flex-wrap gap-2 lg:block lg:space-y-1">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="block rounded-lg border border-transparent px-4 py-2.5 text-base font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
                  >
                    {t(sec.title.ko, sec.title.en)}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-24">
            {sections.map((sec) => {
              const [head, rest] = split(t(sec.title.ko, sec.title.en));
              return (
                <section key={sec.id} id={sec.id} className="scroll-mt-36">
                  <h2 className="text-4xl uppercase leading-none tracking-tight sm:text-5xl">
                    <span className="font-extrabold">{head}</span>
                    <span className="font-medium text-white/85">{rest}</span>
                  </h2>
                  <div className="mt-8 space-y-4">
                    {sec.items.map((it) => (
                      <details
                        key={it.q.en}
                        className="group rounded-lg border border-white/30 transition open:border-white/60"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg font-bold">
                          {t(it.q.ko, it.q.en)}
                          <span
                            className="material-symbols-outlined flex-none rounded-full border border-white/40 p-1 text-[20px] text-white/70 transition group-open:rotate-180"
                            aria-hidden
                          >
                            keyboard_arrow_down
                          </span>
                        </summary>
                        <div className="space-y-2 px-6 pb-6 text-base leading-7 text-white/80">
                          {t(it.a.ko.join("\n"), it.a.en.join("\n"))
                            .split("\n")
                            .map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
