import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { HubShell } from "@/components/HubShell";

/* ===== 데이터 (legacy/index.html) ===== */
const SERVICES = [
  {
    href: "/store",
    emoji: "🛍️",
    title: "Store",
    desc: "제품과 굿즈를 둘러보고 구매할 수 있는 온라인 스토어.",
  },
  {
    href: "/training",
    emoji: "🎓",
    title: "Training",
    desc: "교육 일정과 트레이닝 프로그램을 확인하세요.",
  },
  {
    href: "/ebook",
    emoji: "📚",
    title: "eBook",
    desc: "전자책을 검색하고 뷰어로 바로 열람할 수 있습니다.",
  },
  {
    href: "/reserve",
    emoji: "🗓️",
    title: "대관 예약",
    desc: "회의실·세미나룸 등 공간을 날짜·시간 선택으로 예약하세요.",
  },
];

const STATS = [
  { n: "355K+", l: "Global Members", s: "as of December 31, 2025" },
  { n: "11,600+", l: "Global Chapters" },
  { n: "$26.9B", l: "Member Generated Business", s: "Last 12 Months" },
  { n: "77", l: "Countries" },
  { n: "17.9M", l: "Member Referrals", s: "Last 12 Months" },
];

const PROGRAMS = [
  {
    t: "Member Success Program",
    k: "MSP",
    d: "신규 멤버가 BNI 시스템에 빠르게 적응하고 성과를 내도록 돕는 기본 트레이닝.",
    img: "photo-1517245386807-bb43f82c33c4",
  },
  {
    t: "PowerTeam Program",
    k: "파워팀",
    d: "업종별 협업 팀을 구성해 멤버 간 레퍼럴 시너지를 극대화합니다.",
    img: "photo-1600880292203-757bb62b4baf",
  },
  {
    t: "Custom Sales Team Building",
    k: "맞춤 영업팀",
    d: "멤버 네트워크를 나만의 외부 영업팀처럼 운영하는 전략을 배웁니다.",
    img: "photo-1521737604893-d14cc237f11d",
  },
  {
    t: "Lifestyle Integration",
    k: "라이프스타일",
    d: "비즈니스와 삶을 연결해 지속 가능한 네트워킹 습관을 만듭니다.",
    img: "photo-1543269865-cbf427effbad",
  },
];

const STEPS = [
  { n: "1", t: "챕터 방문하기", d: "가까운 지역 챕터의 위클리 미팅에 게스트로 참여합니다" },
  { n: "2", t: "멤버 만나기", d: "멤버들이 어떻게 당신의 비즈니스 성장을 돕는지 확인합니다" },
  { n: "3", t: "멤버 신청", d: "BNI 챕터의 정식 멤버로 가입합니다" },
];

export default function Home() {
  return (
    <HubShell>
      <main>
      <Hero />

      {/* ===== 통합 서비스 ===== */}
      <section className="wrap py-20" id="services">
        <SectionHeading
          eyebrow="Services"
          title="하나의 플랫폼에서 운영하는 통합 서비스"
          sub="BNI Korea Hub의 모든 서비스를 한 곳에서 이용하세요."
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="card block p-8 transition hover:-translate-y-1"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-soft text-3xl">
                {s.emoji}
              </div>
              <h3 className="text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{s.desc}</p>
              <p className="mt-5 text-sm font-bold text-red">바로가기 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Intro ===== */}
      <section className="wrap pb-16">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <h2 className="text-3xl font-extrabold leading-snug md:text-[40px]">
            <span className="text-red">Changing the Way</span>
            <br />
            the World Does Business
          </h2>
          <div>
            <p className="text-lg leading-relaxed text-body">
              BNI 코리아 내셔널 오피스가 제안하는 검증된 비즈니스 네트워킹. 전국의
              멤버들이 매주 모여 서로에게 레퍼럴을 전달하고, 단계별 프로그램으로
              비즈니스를 함께 성장시킵니다. 당신의 차례입니다.
            </p>
            <div className="group relative mt-8 cursor-pointer overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-56 w-full object-cover"
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&h=500&q=80"
                alt=""
              />
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-red transition group-hover:scale-110">
                  <span className="material-symbols-outlined !text-[34px]">
                    play_arrow
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="bg-soft">
        <div className="wrap py-16">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.l}>
                <p className="text-4xl font-extrabold text-red lg:text-5xl">
                  {s.n}
                </p>
                <p className="mt-2 text-sm font-semibold text-body">{s.l}</p>
                {s.s ? <p className="text-xs text-body/60">{s.s}</p> : null}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link className="btn btn-red" href="/training/schedule">
              Schedule 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Programs ===== */}
      <section className="wrap py-20">
        <SectionHeading
          eyebrow="Programs"
          title="BNI 핵심 프로그램"
          sub="멤버의 성장을 단계별로 이끄는 4가지 프로그램입니다."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((c) => (
            <a key={c.t} className="card block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
                src={`https://images.unsplash.com/${c.img}?auto=format&fit=crop&w=700&h=525&q=80`}
                alt=""
              />
              <div className="p-6">
                <span className="mb-3 inline-block rounded-full bg-red-soft px-3 py-1 text-xs font-bold text-red">
                  {c.k}
                </span>
                <h3 className="font-extrabold leading-snug">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{c.d}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ===== 3 Steps ===== */}
      <section className="bg-ink text-white">
        <div className="wrap py-20 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            3단계로 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            BNI 트레이닝 미팅에 초대받아, 레퍼럴의 힘을 직접 경험하세요.
          </p>
          <div className="mt-14 grid gap-8 text-left md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/5 p-8"
              >
                <p className="text-5xl font-black text-red">{s.n}</p>
                <h3 className="mt-3 text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link className="btn btn-red" href="/#services">
              Join us
            </Link>
          </div>
        </div>
      </section>
      </main>
    </HubShell>
  );
}
