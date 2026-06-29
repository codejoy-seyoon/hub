"use client";

import { useEffect, useState } from "react";
import { productImg } from "@/lib/data/products";

type Slide = {
  img: string;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    img: "goods/BNI-Korea_pouch_mug-set-6623b5.png",
    eyebrow: "Official Goods 2026",
    title: (
      <>
        BNI KOREA
        <br />
        OFFICIAL STORE
      </>
    ),
    sub: "멤버를 위한 공식 굿즈 컬렉션",
    cta: "컬렉션 둘러보기",
  },
  {
    img: "goods/BNI-Korea_-_-787fa0.jpg",
    eyebrow: "Signature",
    title: (
      <>
        시그니처
        <br />
        실크 스카프
      </>
    ),
    sub: "실크 100%, BNI 시그니처 패턴",
    cta: "자세히 보기",
  },
  {
    img: "goods/BNI-Korea_-1-832e62.jpg",
    eyebrow: "Business Class",
    title: (
      <>
        클래식
        <br />
        넥타이 컬렉션
      </>
    ),
    sub: "비즈니스 미팅을 위한 품격",
    cta: "자세히 보기",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  const s = SLIDES[i];

  return (
    <header className="hero-carousel">
      <div
        className="hero-slide"
        style={{ backgroundImage: `url('${productImg(s.img)}')` }}
      >
        <div className="hero-caption">
          <p className="hero-eyebrow">{s.eyebrow}</p>
          <h1 className="hero-title">{s.title}</h1>
          <p className="hero-sub">{s.sub}</p>
          <a href="#productGrid" className="btn lv-btn-light">
            {s.cta}
          </a>
        </div>
      </div>

      <button
        type="button"
        className="carousel-arrow prev"
        aria-label="이전"
        onClick={() => go(-1)}
      >
        <i className="bi bi-chevron-left" />
      </button>
      <button
        type="button"
        className="carousel-arrow next"
        aria-label="다음"
        onClick={() => go(1)}
      >
        <i className="bi bi-chevron-right" />
      </button>

      <div className="carousel-dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`슬라이드 ${idx + 1}`}
            className={idx === i ? "active" : ""}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </header>
  );
}
