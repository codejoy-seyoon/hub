import Link from "next/link";
import { SPACES, spaceImg } from "@/lib/data/spaces";
import { won } from "@/lib/format";
import { ReserveHeader } from "@/components/reserve/ReserveHeader";

export const metadata = { title: "BNI KOREA | 대관 예약" };

const STEPS = [
  { n: 1, t: "예약자 정보", d: "이름 · 전화번호 입력" },
  { n: 2, t: "날짜 · 시간 선택", d: "원하는 일정 선택" },
  { n: 3, t: "공간 · 정보 입력", d: "공간 선택 후 신청" },
  { n: 4, t: "예약 완료", d: "확정 안내 수신" },
];

export default function ReservePage() {
  return (
    <>
      <ReserveHeader active="guide" />
      <main className="guide-main">
        <div className="guide-hero">
          <p className="guide-eyebrow">SPACE RENTAL</p>
          <h1 className="guide-title">BNI KOREA 공간 대관</h1>
          <p className="guide-sub">원하는 공간을 선택해 예약을 시작하세요.</p>
          <Link href="#spaceList" className="btn btn-primary guide-cta">
            공간 선택하기
          </Link>
        </div>

        <section className="guide-section">
          <h2 className="guide-h2">예약 방법</h2>
          <div className="guide-steps">
            {STEPS.map((s) => (
              <div className="guide-step" key={s.n}>
                <span className="gs-num">{s.n}</span>
                <div>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="guide-section" id="spaceList">
          <h2 className="guide-h2">대관 가능 공간</h2>
          <p style={{ textAlign: "center", color: "var(--gray-500)", fontSize: 14, margin: "-12px 0 22px" }}>
            예약하실 공간을 선택해 주세요.
          </p>
          <div className="guide-spaces">
            {SPACES.map((s) => (
              <div className="guide-space" key={s.id}>
                <div
                  className="guide-space__photo"
                  style={{ backgroundImage: `url('${spaceImg(s.img, 420)}')` }}
                />
                <div className="guide-space__body">
                  <div className="guide-space__name">{s.name}</div>
                  <div className="guide-space__meta">
                    {s.location} · 면적 {s.area}㎡ · 수용 {s.capacity}인
                  </div>
                  <div className="guide-space__price">
                    {won(s.hourly_price)}
                    <span className="per"> / 시간</span>
                  </div>
                  <Link href={`/reserve/${s.id}`} className="btn btn-primary guide-space__btn">
                    이 공간 예약하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
