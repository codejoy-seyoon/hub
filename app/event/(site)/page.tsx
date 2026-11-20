import Link from "next/link";
import { headers } from "next/headers";
import { EVENTS, EVENT_STATUS_LABEL, eventBaseFromHost, eventPath, isOnSale } from "@/lib/data/events";

// 이벤트 허브 첫 화면: 진행 중인 행사가 위, 지난 행사가 아래(연도순).
export default async function EventHubPage() {
  const base = eventBaseFromHost((await headers()).get("host"));
  const current = EVENTS.filter((e) => e.status !== "ended").sort((a, b) => b.year - a.year);
  const past = EVENTS.filter((e) => e.status === "ended").sort((a, b) => b.year - a.year);

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">BNI Korea Events</h1>
      <p className="mt-2 text-bni-body">BNI Korea 공식 행사 안내와 티켓 결제</p>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">진행 중인 행사 · Current</h2>
        {current.length === 0 ? (
          <p className="rounded-2xl border border-bni-line p-6 text-sm text-bni-body">
            지금 진행 중인 행사가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4">
            {current.map((e) => {
              const label = isOnSale(e) ? EVENT_STATUS_LABEL.on_sale : EVENT_STATUS_LABEL[e.status === "on_sale" ? "sold_out" : e.status];
              return (
                <li key={e.code}>
                  <Link
                    href={eventPath(base, `/${e.code}`)}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-bni-line p-6 transition hover:border-bni-red"
                  >
                    <div>
                      <p className="text-xl font-extrabold">{e.name}</p>
                      <p className="mt-1 text-sm text-bni-body">{e.nameKo}</p>
                    </div>
                    <span className="flex-none rounded-full bg-bni-red-soft px-3 py-1 text-xs font-bold text-bni-red-dark">
                      {label.ko} · {label.en}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold">지난 행사 · Past events</h2>
          <ul className="grid gap-3">
            {past.map((e) => (
              <li key={e.code}>
                <Link
                  href={eventPath(base, `/${e.code}`)}
                  className="flex items-center justify-between rounded-2xl border border-bni-line p-5 text-bni-body transition hover:border-bni-ink"
                >
                  <span className="font-semibold text-bni-ink">{e.name}</span>
                  <span className="text-xs">{e.year}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
