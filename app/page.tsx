import Link from "next/link";

const SECTIONS = [
  { href: "/store", title: "스토어", desc: "BNI 공식 굿즈 구매", emoji: "🛍️" },
  { href: "/reserve", title: "대관 예약", desc: "회의실·세미나룸 예약", emoji: "📅" },
  { href: "/training", title: "트레이닝", desc: "챕터 트레이닝 수강 신청", emoji: "🎓" },
  { href: "/ebook", title: "이북", desc: "전자책 구매·열람", emoji: "📚" },
];

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-r from-bni-red-strong to-bni-red-dark px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold opacity-90">BNI KOREA</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            하나의 허브에서
            <br />
            구매 · 예약 · 학습까지
          </h1>
          <p className="mt-4 max-w-lg text-white/85">
            스토어, 대관 예약, 트레이닝, 이북을 토스페이먼츠 결제로 한 번에.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-bni-line p-6 transition hover:border-bni-red hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">{s.emoji}</div>
              <h2 className="text-lg font-bold group-hover:text-bni-red">{s.title}</h2>
              <p className="mt-1 text-sm text-bni-body">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
