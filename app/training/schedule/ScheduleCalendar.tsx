"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  eventsByDay,
  trainingsByDay,
  type DayTraining,
} from "@/lib/data/schedule";

const TODAY = 9; // 2026-06-09
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

type Cell = { d: number; muted: boolean; sub: string };

function buildCells(): Cell[] {
  const cells: Cell[] = [{ d: 31, muted: true, sub: "5월" }];
  for (let d = 1; d <= 30; d++) cells.push({ d, muted: false, sub: d === 1 ? "6월" : "" });
  let n = 1;
  while (cells.length < 42) {
    cells.push({ d: n, muted: true, sub: n === 1 ? "7월" : "" });
    n++;
  }
  return cells;
}

const ST_COLOR: Record<string, string> = {
  진행중: "background:#fad2cf;color:#a50e0e",
  마감임박: "background:#202124;color:#fff",
  모집중: "border:1px solid #dadce0;color:#5f6368",
};

function EventChip({ title, color }: { title: string; color: string }) {
  if (color.includes("dotstyle")) {
    return (
      <div className={`ev ${color}`}>
        <span className="d" />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      </div>
    );
  }
  return <div className={`ev ${color}`}>{title}</div>;
}

function TrainingCard({ e }: { e: DayTraining }) {
  return (
    <div className="sdcard">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
        loading="lazy"
        src={`https://images.unsplash.com/${e.img}?auto=format&fit=crop&w=520&h=390&q=80`}
        alt=""
      />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="sd-badge" style={{ background: "#fdebed", color: "#c2185b" }}>
            {e.chapter}
          </span>
          <span
            className="sd-badge"
            style={cssToObj(ST_COLOR[e.status] || ST_COLOR["모집중"])}
          >
            {e.status}
          </span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#202124", lineHeight: 1.35 }}>
          {e.title}
        </h3>
        <p style={{ fontSize: 13, color: "#5f6368", margin: "10px 0 2px" }}>👤 {e.who}</p>
        <p style={{ fontSize: 13, color: "#5f6368", margin: 0 }}>🕒 {e.time}</p>
        <Link href="/training" className="sd-apply">
          신청하기
        </Link>
      </div>
    </div>
  );
}

function cssToObj(css: string): React.CSSProperties {
  const o: Record<string, string> = {};
  css.split(";").forEach((rule) => {
    const [k, v] = rule.split(":");
    if (!k || !v) return;
    const key = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[key] = v.trim();
  });
  return o as React.CSSProperties;
}

export function ScheduleCalendar() {
  const cells = useMemo(buildCells, []);
  const EV = useMemo(eventsByDay, []);
  const details = useMemo(trainingsByDay, []);

  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [viewMenu, setViewMenu] = useState(false);
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [carIdx, setCarIdx] = useState(0);

  const idxOfDay = (d: number) => cells.findIndex((c) => !c.muted && c.d === d);
  const monthOf = (gi: number) => (gi === 0 ? "5" : gi >= 31 ? "7" : "6");

  const periodLabel = (() => {
    if (view === "month") return "2026년 6월";
    if (view === "day") return `2026년 6월 ${selectedDay}일`;
    const start = Math.floor(idxOfDay(selectedDay) / 7) * 7;
    const wk = cells.slice(start, start + 7);
    return `2026년 ${monthOf(start)}/${wk[0].d} – ${monthOf(start + 6)}/${wk[6].d}`;
  })();

  function openDay(day: number, dowIdx: number) {
    setSelectedDay(day);
    setModalDay(day);
    setCarIdx(0);
    void dowIdx;
  }

  const curList = modalDay != null ? details[modalDay] ?? [] : [];

  return (
    <>
      <div className="app">
        {/* Top bar */}
        <header className="topbar">
          <div className="ic-btn"><span className="material-symbols-outlined">menu</span></div>
          <Link href="/training" className="mr-2 flex items-center gap-2">
            <span
              className="logo-cal grid place-items-center rounded"
              style={{ background: "#fff", border: "2px solid #4285f4", color: "#4285f4", fontWeight: 800, fontSize: 13, lineHeight: 1, width: 32, height: 32 }}
            >
              31
            </span>
            <span style={{ fontSize: 22, color: "#5f6368", fontWeight: 400 }}>Schedule</span>
          </Link>
          <button className="today-btn ml-2" onClick={() => { setSelectedDay(TODAY); setView("month"); }}>
            오늘
          </button>
          <div className="ic-btn"><span className="material-symbols-outlined">chevron_left</span></div>
          <div className="ic-btn"><span className="material-symbols-outlined">chevron_right</span></div>
          <h1 style={{ fontSize: 22, color: "#3c4043", fontWeight: 400, marginLeft: 8, whiteSpace: "nowrap" }}>
            {periodLabel}
          </h1>
          <div style={{ flex: 1 }} />
          <div className="ic-btn"><span className="material-symbols-outlined">search</span></div>
          <div className="ic-btn hidden sm:grid"><span className="material-symbols-outlined">help</span></div>
          <div className="ic-btn hidden sm:grid"><span className="material-symbols-outlined">settings</span></div>
          <div className="view-wrap ml-1">
            <button className="view-btn" onClick={() => setViewMenu((v) => !v)}>
              <span>{view === "month" ? "월" : view === "week" ? "주" : "일"}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_drop_down</span>
            </button>
            {viewMenu && (
              <div className="view-menu">
                {(["month", "week", "day"] as const).map((v) => (
                  <button
                    key={v}
                    className={view === v ? "active" : ""}
                    onClick={() => { setView(v); setViewMenu(false); }}
                  >
                    {v === "month" ? "월" : v === "week" ? "주" : "일"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            style={{ width: 32, height: 32, borderRadius: "50%", background: "#c2185b", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, marginLeft: 4 }}
          >
            B
          </div>
        </header>

        <div className="cal">
          {/* ===== Month ===== */}
          {view === "month" && (
            <>
              <div className="dow-row">
                <div style={{ color: "#d93025" }}>일</div>
                <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div>
                <div style={{ color: "#1a73e8" }}>토</div>
              </div>
              <div className="grid">
                {cells.map((c, idx) => {
                  const isSun = idx % 7 === 0;
                  const isSat = idx % 7 === 6;
                  const numCls = !c.muted && c.d === TODAY ? "today" : isSun ? "sun" : isSat ? "sat" : "";
                  const list = !c.muted ? EV[c.d] ?? [] : [];
                  return (
                    <div
                      key={idx}
                      className={`cell ${c.muted ? "muted" : ""} ${selectedDay === c.d && !c.muted ? "sel" : ""}`}
                      onClick={() => { if (!c.muted) openDay(c.d, idx % 7); }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
                        {c.sub && <span style={{ fontSize: 11, color: "#70757a", marginRight: 3 }}>{c.sub}</span>}
                        <span className={`dnum ${numCls}`}>{c.d}</span>
                      </div>
                      <div className="evs">
                        {list.slice(0, 3).map(([t, cls], i) => (
                          <EventChip key={i} title={t} color={cls} />
                        ))}
                        {list.length > 3 && <div className="more">+{list.length - 3}개 더보기</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== Week ===== */}
          {view === "week" && (
            <div className="week-wrap">
              <div className="week-grid">
                {(() => {
                  const start = Math.floor(idxOfDay(selectedDay) / 7) * 7;
                  return cells.slice(start, start + 7).map((c, i) => {
                    const today = !c.muted && c.d === TODAY;
                    const wd = i === 0 ? "sun" : i === 6 ? "sat" : "";
                    const list = !c.muted ? EV[c.d] ?? [] : [];
                    return (
                      <div key={i} className={`week-col ${c.muted ? "muted" : ""}`}>
                        <div
                          className={`wch ${wd}`}
                          onClick={() => { if (!c.muted) { setSelectedDay(c.d); setView("day"); } }}
                        >
                          <div className="wd">{DOW[i]}{c.sub ? ` · ${c.sub}` : ""}</div>
                          <div className={`wn ${today ? "today" : ""}`}>{c.d}</div>
                        </div>
                        <div className="week-evs">
                          {c.muted ? (
                            <div className="week-empty">·</div>
                          ) : list.length ? (
                            list.map(([t, cls], k) => <EventChip key={k} title={t} color={cls} />)
                          ) : (
                            <div className="week-empty">일정 없음</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ===== Day ===== */}
          {view === "day" && (
            <div className="day-view">
              <div className="day-inner">
                <h3 className="day-title">
                  {selectedDay}일 ({DOW[idxOfDay(selectedDay) % 7]}) 일정
                </h3>
                {(() => {
                  const rich = details[selectedDay] ?? [];
                  const ev = EV[selectedDay] ?? [];
                  if (rich.length) {
                    return rich.map((e) => (
                      <div className="day-ev" key={e.id}>
                        <div className="dtime">{e.time}</div>
                        <div className="dbar" />
                        <div className="dbody">
                          <h4>{e.title}</h4>
                          <p>{e.chapter} · {e.who}</p>
                          <p>{e.status}</p>
                        </div>
                      </div>
                    ));
                  }
                  if (ev.length) {
                    return ev.map(([t], i) => (
                      <div className="day-ev" key={i}>
                        <div className="dtime"><span>종일</span></div>
                        <div className="dbar" />
                        <div className="dbody"><h4>{t}</h4></div>
                      </div>
                    ));
                  }
                  return (
                    <div className="day-empty">
                      <p>예정된 일정이 없습니다.</p>
                      <p>다른 날짜를 선택해 주세요.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Day modal ===== */}
      {modalDay != null && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalDay(null); }}>
          <div className="modal-card">
            <button className="modal-close" aria-label="닫기" onClick={() => setModalDay(null)}>
              ×
            </button>
            <p className="modal-eyebrow">Selected Day Training</p>
            <h2>2026년 6월 {modalDay}일 ({DOW[idxOfDay(modalDay) % 7]})</h2>
            <div className="carousel">
              {curList.length ? (
                <TrainingCard e={curList[carIdx]} />
              ) : (
                <div className="sdcard" style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#3c4043" }}>
                    예정된 트레이닝이 없습니다.
                  </p>
                  <p style={{ fontSize: 14, margin: 0, color: "#70757a" }}>다른 날짜를 선택해 주세요.</p>
                </div>
              )}
              {curList.length > 1 && (
                <>
                  <button
                    className="car-nav prev"
                    aria-label="이전"
                    onClick={() => setCarIdx((i) => (i - 1 + curList.length) % curList.length)}
                  >
                    ‹
                  </button>
                  <button
                    className="car-nav next"
                    aria-label="다음"
                    onClick={() => setCarIdx((i) => (i + 1) % curList.length)}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {curList.length > 1 && (
              <div className="car-dots">
                {curList.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === carIdx ? "active" : ""}`}
                    onClick={() => setCarIdx(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
