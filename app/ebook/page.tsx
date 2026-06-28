import Link from "next/link";
import { BOOKS } from "@/lib/data/books";
import { BookGrid } from "./BookGrid";
import { EbookHeroCarousel } from "@/components/ebook/EbookHeroCarousel";

export const metadata = { title: "Pagely — BNI eBook Store" };

const CATEGORIES = [
  { icon: "bi-briefcase", name: "일반", desc: "경제경영 · 자기개발" },
  { icon: "bi-book", name: "장르", desc: "로맨스 · 판타지" },
  { icon: "bi-emoji-smile", name: "만화", desc: "순정만화 · 스포츠" },
  { icon: "bi-headphones", name: "오디오북", desc: "경제경영 · 자기개발" },
];

const HOWTO = [
  { icon: "bi-person-plus", t: "01. 회원가입", d: "이메일로 30초 만에 가입하고 첫 달 무료 혜택을 받으세요" },
  { icon: "bi-search", t: "02. 도서 검색", d: "30만 권 중 원하는 책을 검색하거나 카테고리로 탐색하세요" },
  { icon: "bi-bag-check", t: "03. 구매 또는 구독", d: "단권 구매 또는 월정액 구독으로 원하는 방식으로 즐기세요" },
  { icon: "bi-tablet", t: "04. 어디서나 독서", d: "PC, 태블릿, 스마트폰 어디서나 이어 읽을 수 있어요" },
];

export default function EbookPage() {
  return (
    <>
      <EbookHeroCarousel />

      {/* 카테고리 */}
      <section className="pg-section">
        <div className="pg-container">
          <div className="mb-4 text-center">
            <p className="section-sub">CATEGORY</p>
            <h2 className="section-title">카테고리</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link key={c.name} href="/ebook">
                <div className="category-card">
                  <i className={`bi ${c.icon}`} />
                  <h6>{c.name}</h6>
                  <p>{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 도서 목록 */}
      <section className="pg-section bg-light-custom">
        <div className="pg-container">
          <div className="mb-4 text-center">
            <p className="section-sub">BOOKS</p>
            <h2 className="section-title">도서 목록</h2>
          </div>
          <BookGrid books={BOOKS} />
        </div>
      </section>

      {/* 구독 배너 */}
      <section className="subscribe-banner">
        <div className="pg-container">
          <p className="section-sub" style={{ color: "rgba(255,255,255,.7)" }}>SUBSCRIPTION</p>
          <h2 className="subscribe-title mb-3">
            첫 달 무료로<br />
            <span>30만 권을 읽어보세요</span>
          </h2>
          <p className="mb-4" style={{ color: "rgba(255,255,255,.75)" }}>
            월 9,900원 · 언제든 해지 가능 · 모든 기기 지원
          </p>
          <Link href="/ebook" className="btn-light-lg">무료로 시작하기</Link>
        </div>
      </section>

      {/* 즐기는 법 */}
      <section className="pg-section">
        <div className="pg-container">
          <div className="mb-5 text-center">
            <p className="section-sub">HOW TO</p>
            <h2 className="section-title">Pagely 제대로 즐기는 법</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {HOWTO.map((h) => (
              <div key={h.t} className="guide-item">
                <div className="guide-icon"><i className={`bi ${h.icon}`} /></div>
                <h6>{h.t}</h6>
                <p>{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
