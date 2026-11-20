"use client";

import { useEffect, useState } from "react";

/**
 * 행사 시작까지 남은 시간 판(slush.org 의 카운트다운 판 참고).
 * 둥근 검은 판 안에 행사명·날짜, 그 아래 큰 숫자와 작은 단위.
 * 시작 시각이 지났으면 0 으로 보여 준다(참고 사이트도 행사 뒤에는 0 으로 남는다).
 */
export function EventCountdown({ startsAt, caption }: { startsAt: string; caption: string }) {
  const target = new Date(startsAt).getTime();
  // 서버와 브라우저의 시계가 달라 생기는 화면 어긋남을 피하려고, 브라우저에서만 계산한다.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null || Number.isNaN(target) ? 0 : Math.max(0, Math.floor((target - now) / 1000));
  const cells: [string, string][] = [
    [String(Math.floor(left / 86400)), "DAYS"],
    [String(Math.floor((left % 86400) / 3600)).padStart(2, "0"), "HRS"],
    [String(Math.floor((left % 3600) / 60)).padStart(2, "0"), "MIN"],
    [String(left % 60).padStart(2, "0"), "SEC"],
  ];

  return (
    <div
      className="rounded-3xl p-8 text-center sm:py-10"
      style={{ background: "linear-gradient(90deg, #1d1d20 0%, #000 38%, #000 62%, #1b1b1e 100%)" }}
      aria-label="Countdown"
    >
      <p className="text-lg font-semibold text-white/60 sm:text-2xl">{caption}</p>
      <div className="mt-8 flex flex-wrap items-end justify-center gap-x-10 gap-y-6 sm:gap-x-20">
        {cells.map(([value, unit]) => (
          <div key={unit} className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold tabular-nums leading-none sm:text-7xl">{value}</span>
            <span className="text-sm font-bold tracking-[0.12em] text-white/60 sm:text-lg">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
