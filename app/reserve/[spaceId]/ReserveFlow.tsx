"use client";

import { useEffect, useMemo, useState } from "react";
import type { Space } from "@/lib/data/spaces";
import { spaceImg, SPACE_ADDONS } from "@/lib/data/spaces";
import { won } from "@/lib/format";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import type { Customer, OrderRequest } from "@/lib/catalog";

/* ----- 날짜 유틸 (기존 reserve/app.js 계승) ----- */
const HOLIDAYS_FIXED = ["01-01", "03-01", "05-05", "06-06", "08-15", "10-03", "10-09", "12-25"];
const HOLIDAYS_2026 = ["02-16", "02-17", "02-18", "05-24", "09-24", "09-25", "09-26"];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isHoliday(d: Date) {
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return HOLIDAYS_FIXED.includes(mmdd) || (d.getFullYear() === 2026 && HOLIDAYS_2026.includes(mmdd));
}
function isDisabledDate(d: Date, today: Date) {
  const day = d.getDay();
  const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return day === 0 || day === 6 || isHoliday(d) || past;
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const BASE_SLOTS = ["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00"];
const DURATIONS = [60, 90, 120, 180];

export function ReserveFlow({ space }: { space: Space }) {
  const today = useMemo(() => new Date(), []);
  const [viewY, setViewY] = useState(today.getFullYear());
  const [viewM, setViewM] = useState(today.getMonth());
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState<{ startMin: number; endMin: number }[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!date) return;
    setBusy([]);
    fetch(`/api/reservations/busy?spaceId=${space.id}&date=${ymd(date)}`)
      .then((r) => r.json())
      .then((d) => setBusy(d.busy ?? []))
      .catch(() => setBusy([]));
  }, [date, space.id]);

  const base = Math.round((space.hourly_price * duration) / 60);
  const extra = addonIds.reduce((s, id) => s + (SPACE_ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const total = base + extra;

  function slotBusy(slot: string) {
    const [h, m] = slot.split(":").map(Number);
    const start = h * 60 + m;
    const end = start + duration;
    return busy.some((b) => start < b.endMin && end > b.startMin);
  }

  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); } else setViewM((m) => m + 1);
  }

  const makeRequest = (customer: Customer): OrderRequest => ({
    domain: "reservation",
    customer,
    spaceId: space.id,
    date: date ? ymd(date) : "",
    time: time ?? "",
    durationMinutes: duration,
    addonIds,
    memo,
  });

  const dateLabel = date ? `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})` : "";

  /* 왼쪽 패널: 선택한 공간 + 일시 */
  const leftPanel = (
    <div className="booking-left">
      <div className="booking-label">선택한 공간</div>
      <div className="display-space">
        <span className="ds-photo" style={{ backgroundImage: `url('${spaceImg(space.img, 160)}')` }} />
        <div>
          <div className="ds-name">{space.name}</div>
          <div className="ds-price">{won(space.hourly_price)} / 시간</div>
        </div>
      </div>
      {date && time && (
        <div className="selected-datetime">
          <svg className="dt-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <div>{dateLabel}</div>
            <div className="dt-time">{time}</div>
          </div>
        </div>
      )}
    </div>
  );

  const summary = (
    <div className="amount-box" style={{ marginTop: 0 }}>
      <div className="amount-row"><span>공간</span><span>{space.name}</span></div>
      <div className="amount-row"><span>일시</span><span>{date ? ymd(date) : "-"} {time}</span></div>
      <div className="amount-row"><span>이용시간</span><span>{duration}분</span></div>
      <div className="amount-row"><span>대관료</span><span>{won(base)}</span></div>
      {addonIds.length > 0 && (
        <div className="amount-row"><span>추가 옵션</span><span>{won(extra)}</span></div>
      )}
      <div className="amount-row total"><span>합계</span><span>{won(total)}</span></div>
    </div>
  );

  /* ===== 결제 단계 ===== */
  if (confirming && date && time) {
    return (
      <main className="booking-main">
        <div style={{ width: "100%", maxWidth: 640 }}>
          <button
            onClick={() => setConfirming(false)}
            className="btn btn-outline"
            style={{ height: 40, padding: "0 16px", marginBottom: 16 }}
          >
            ← 옵션 다시 선택
          </button>
          <CheckoutPanel makeRequest={makeRequest} amount={total} summary={summary} />
        </div>
      </main>
    );
  }

  const showOptions = !!(date && time);

  return (
    <main className="booking-main">
      <div className="booking-card">
        {leftPanel}

        {!showOptions ? (
          <>
            {/* 가운데: 달력 */}
            <div className="booking-middle">
              <h2>날짜를 선택해 주세요.</h2>
              <div className="calendar">
                <div className="calendar-header">
                  <span className="calendar-title">{MONTHS[viewM]} {viewY}</span>
                  <div className="calendar-nav">
                    <button onClick={prevMonth} aria-label="이전 달">‹</button>
                    <button onClick={nextMonth} aria-label="다음 달">›</button>
                  </div>
                </div>
                <div className="calendar-weekdays">
                  {DOW.map((d) => <span key={d}>{d}</span>)}
                </div>
                <div className="calendar-days">
                  {cells.map((d, i) => {
                    if (d === null) return <span key={i} />;
                    const cellDate = new Date(viewY, viewM, d);
                    const disabled = isDisabledDate(cellDate, today);
                    const selected = date && ymd(date) === ymd(cellDate);
                    return (
                      <button
                        key={i}
                        disabled={disabled}
                        onClick={() => { setDate(cellDate); setTime(null); }}
                        className={`calendar-day ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 오른쪽: 시간 */}
            <div className="booking-right">
              <div className="booking-right-header">
                <h2>시간 선택</h2>
                <p>{date ? dateLabel : "날짜를 선택하세요"}</p>
              </div>
              <div className="time-slots">
                {date ? (
                  BASE_SLOTS.map((slot) => {
                    const bz = slotBusy(slot);
                    return (
                      <button
                        key={slot}
                        disabled={bz}
                        onClick={() => setTime(slot)}
                        className={`time-slot-btn ${time === slot ? "selected" : ""} ${bz ? "unavailable" : ""}`}
                      >
                        {slot}
                      </button>
                    );
                  })
                ) : (
                  <p style={{ color: "var(--gray-400)", fontSize: 14, padding: "8px 0" }}>
                    먼저 날짜를 선택해 주세요.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ===== 옵션 · 금액 ===== */
          <div className="booking-form-area">
            <button
              onClick={() => setTime(null)}
              className="btn btn-outline"
              style={{ height: 38, padding: "0 14px", marginBottom: 20 }}
            >
              ← 날짜·시간 다시 선택
            </button>
            <h2>옵션 선택 · 금액 확인</h2>

            <div className="form-group">
              <label className="form-label">이용시간 <span className="required">*</span></label>
              <div className="duration-chips">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`duration-chip ${duration === d ? "active" : ""}`}
                    onClick={() => setDuration(d)}
                  >
                    {d}분
                  </button>
                ))}
              </div>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div className="form-group">
                <label className="form-label">기본 제공 시설 <span className="opt-free">무료</span></label>
                <ul className="facility-list">
                  {space.amenities.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">추가 옵션 <span className="opt-paid">유료</span></label>
              <div className="addon-list">
                {SPACE_ADDONS.map((a) => {
                  const on = addonIds.includes(a.id);
                  return (
                    <label key={a.id} className="addon">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) =>
                          setAddonIds((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))
                        }
                      />
                      <span className="addon-name">{a.name}</span>
                      <span className="addon-price">+{won(a.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea
                className="textarea"
                placeholder="전달하실 내용이 있다면 적어주세요."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            <div className="amount-box">
              <div className="amount-row"><span>대관료</span><span>{won(base)}</span></div>
              <div className="amount-row"><span>추가 옵션</span><span>{won(extra)}</span></div>
              <div className="amount-row total"><span>합계</span><span>{won(total)}</span></div>
            </div>

            <button className="btn btn-primary booking-submit" onClick={() => setConfirming(true)}>
              예약하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
