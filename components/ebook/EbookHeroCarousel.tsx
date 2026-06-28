"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const WAVES = [50, 90, 140, 190, 240, 270, 240, 190, 140, 90, 50];

export function EbookHeroCarousel() {
  const [i, setI] = useState(0);
  const n = 3;
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="pg-carousel">
      {/* Slide 1 */}
      {i === 0 && (
        <div className="hero-slide slide-1">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="hero-badge">📚 북마스터 PICK</span>
              <p className="hero-sub">BEST ECONOMY &amp; BUSINESS</p>
              <h1 className="hero-title">북마스터가 선정한<br />최고의 경제경영서</h1>
              <p className="hero-desc">각 분야 전문가 북마스터가 엄선한<br />이달의 필독 경제경영 베스트 3</p>
              <div className="mt-3 flex gap-2">
                <Link href="/ebook" className="btn-light-lg">지금 읽기</Link>
                <Link href="/ebook" className="btn-outline-light-lg">전체 보기</Link>
              </div>
            </div>
            <div className="hero-books">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ebook-img/book1.png" height={240} className="hero-book-img rotate-left" alt="" style={{ height: 240 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ebook-img/book2.png" height={280} className="hero-book-img" alt="" style={{ height: 280 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ebook-img/book3.png" height={240} className="hero-book-img rotate-right" alt="" style={{ height: 240 }} />
            </div>
          </div>
        </div>
      )}

      {/* Slide 2 */}
      {i === 1 && (
        <div className="hero-slide slide-2">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="hero-badge">🎧 오디오북</span>
              <p className="hero-sub">LISTEN TO BOOKS</p>
              <h1 className="hero-title">눈을 감고<br />책을 들어보세요</h1>
              <p className="hero-desc">소리로 만나는 세상의 모든 이야기</p>
              <div className="mt-3 flex gap-2">
                <Link href="/ebook" className="btn-light-lg">오디오북 보기</Link>
                <Link href="/ebook" className="btn-outline-light-lg">전체 보기</Link>
              </div>
            </div>
            <div className="sound-wave">
              {WAVES.map((h, k) => (
                <div key={k} className="wave-bar" style={{ height: h }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide 3 */}
      {i === 2 && (
        <div className="hero-slide slide-3">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="hero-badge">👑 첫 달 무료</span>
              <p className="hero-sub">구독 플랜</p>
              <h1 className="hero-title">무제한 독서,<br />단 하나의 구독</h1>
              <p className="hero-desc">30만 권 전 장르 무제한</p>
              <div className="mt-3 flex gap-2">
                <Link href="/ebook" className="btn-light-lg">무료로 시작</Link>
              </div>
            </div>
            <div className="price-card">
              <span className="price-tag">첫 달 무료</span>
              <p className="price-old">월 19,900원</p>
              <p className="price-new">₩9,900</p>
              <p className="price-unit">/ 월 · 언제든 해지</p>
            </div>
          </div>
        </div>
      )}

      <button className="pg-car-ctrl prev" aria-label="이전" onClick={() => setI((p) => (p - 1 + n) % n)}>
        <i className="bi bi-chevron-left" />
      </button>
      <button className="pg-car-ctrl next" aria-label="다음" onClick={() => setI((p) => (p + 1) % n)}>
        <i className="bi bi-chevron-right" />
      </button>
      <div className="pg-car-dots">
        {[0, 1, 2].map((k) => (
          <button key={k} className={k === i ? "active" : ""} onClick={() => setI(k)} aria-label={`슬라이드 ${k + 1}`} />
        ))}
      </div>
    </section>
  );
}
