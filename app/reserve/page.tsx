import Link from "next/link";
import { SPACES, spaceImg } from "@/lib/data/spaces";
import { won } from "@/lib/format";

export const metadata = { title: "대관 예약 | BNI KOREA HUB" };

export default function ReservePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">대관 예약</h1>
        <p className="mt-2 text-bni-body">회의실·세미나룸을 선택해 예약하세요.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPACES.map((s) => (
          <Link
            key={s.id}
            href={`/reserve/${s.id}`}
            className="group overflow-hidden rounded-2xl border border-bni-line transition hover:shadow-lg"
          >
            <div className="aspect-video overflow-hidden bg-bni-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spaceImg(s.img, 600)}
                alt={s.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold group-hover:text-bni-red">{s.name}</h3>
              <p className="mt-1 text-sm text-bni-body">
                {s.location} · 면적 {s.area}㎡ · 수용 {s.capacity}인
              </p>
              <p className="mt-2 font-extrabold text-bni-red">
                {won(s.hourly_price)}
                <span className="text-sm font-normal text-bni-body"> / 시간</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
