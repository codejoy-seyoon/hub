import Link from "next/link";
import { TRAININGS, trainingImg } from "@/lib/data/trainings";
import { won } from "@/lib/format";

export const metadata = { title: "트레이닝 | BNI KOREA HUB" };

const STATUS_STYLE: Record<string, string> = {
  모집중: "bg-emerald-50 text-emerald-700",
  진행중: "bg-blue-50 text-blue-700",
  마감임박: "bg-bni-red-soft text-bni-red",
};

export default function TrainingPage() {
  const list = [...TRAININGS].sort((a, b) => a.day - b.day);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">트레이닝</h1>
        <p className="mt-2 text-bni-body">2026년 6월 챕터 트레이닝 · 수강 신청</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <Link
            key={t.id}
            href={`/training/${t.id}`}
            className="group overflow-hidden rounded-2xl border border-bni-line transition hover:shadow-lg"
          >
            <div className="aspect-video overflow-hidden bg-bni-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trainingImg(t.img, 600)}
                alt={t.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[t.status] ?? "bg-bni-soft text-bni-body"}`}>
                  {t.status}
                </span>
                <span className="text-xs text-bni-body">{t.date} · {t.time}</span>
              </div>
              <h3 className="font-bold group-hover:text-bni-red">{t.title}</h3>
              <p className="mt-1 text-sm text-bni-body">{t.chapter} · {t.who}</p>
              <p className="mt-2 font-extrabold text-bni-red">{won(t.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
