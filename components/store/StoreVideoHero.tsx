"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { storeHref } from "@/lib/storefront";
import { StoreIcon } from "./StoreIcon";
import styles from "./StoreVideoHero.module.css";

export function StoreVideoHero({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, [src]);

  return (
    <section className={styles.hero} aria-labelledby="store-title" style={{ backgroundImage: `url(${poster})` }}>
      <video
        ref={video}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        width={2520}
        height={1080}
        className={styles.video}
        aria-label="BNI 굿즈와 함께하는 하루: 조깅, 배지 달기, 출근과 미팅, 드라이버 샷과 골프공 비행"
        onError={() => setUnavailable(true)}
        hidden={unavailable}
      />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.kicker}>일상에 함께하는 BNI</p>
        <h1 id="store-title" className={styles.title}>
          <span className={styles.line}><span>당신의 하루에,</span></span>
          <span className={styles.line}><span>BNI를 더하다.</span></span>
        </h1>
        <p className={styles.description}>아침의 활력부터 하루 끝의 여유까지.</p>
        <Link href={storeHref()} className={styles.button}>
          굿즈 만나보기 <StoreIcon name="arrow" size={18} />
        </Link>
      </div>
      <aside className={styles.quickMenu} aria-label="BNI Store 안내">
        <span className={styles.menuAccent} aria-hidden="true" />
        <p className={styles.menuHeading}>BNI Store 안내</p>
        {/* 연결 주소는 추후 지정한다. 현재는 링크 동작 없는 안내 UI만 표시한다. */}
        <ul className={styles.menuItems}>
          <li>
            <span>이용안내</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
            </svg>
          </li>
          <li>
            <span>문의하기</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 18 18 6M6 6h12v12" />
            </svg>
          </li>
        </ul>
      </aside>
    </section>
  );
}
