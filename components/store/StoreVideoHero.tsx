"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { storeHref } from "@/lib/storefront";
import { StoreIcon } from "./StoreIcon";
import styles from "./StoreVideoHero.module.css";

export function StoreVideoHero({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
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

  const togglePlayback = () => {
    if (!video.current) return;
    if (video.current.paused) void video.current.play().catch(() => {});
    else video.current.pause();
  };

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
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
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
      {!unavailable && (
        <button className={styles.playback} type="button" onClick={togglePlayback} aria-label={paused ? "배너 영상 재생" : "배너 영상 일시정지"}>
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        </button>
      )}
    </section>
  );
}
