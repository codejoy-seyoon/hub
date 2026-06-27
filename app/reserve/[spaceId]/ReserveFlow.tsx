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

  // 선택 날짜의 예약 현황 조회
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

  // 달력 셀
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

  const summary = (
    <section className="rounded-2xl border border-bni-line p-5">
      <h2 className="mb-4 text-lg font-bold">예약 내역</h2>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between"><dt className="text-bni-body">공간</dt><dd className="font-semibold">{space.name}</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">일시</dt><dd>{date ? ymd(date) : "-"} {time}</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">이용시간</dt><dd>{duration}분</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">대관료</dt><dd>{won(base)}</dd></div>
        {addonIds.length > 0 && (
          <div className="flex justify-between"><dt className="text-bni-body">추가 옵션</dt><dd>{addonIds.map((id) => SPACE_ADDONS.find((a) => a.id === id)?.name).join(", ")} ({won(extra)})</dd></div>
        )}
        <div className="mt-2 flex justify-between border-t border-bni-line pt-3 text-base font-extrabold"><dt>총 결제금액</dt><dd className="text-bni-red">{won(total)}</dd></div>
      </dl>
    </section>
  );

  if (confirming && date && time) {
    return (
      <div>
        <button onClick={() => setConfirming(false)} className="mb-4 text-sm font-semibold text-bni-body hover:text-bni-red">
          ← 옵션 다시 선택
        </button>
        <CheckoutPanel makeRequest={makeRequest} amount={total} summary={summary} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 공간 헤더 */}
      <div className="overflow-hidden rounded-2xl border border-bni-line">
        <div className="aspect-[2/1] overflow-hidden bg-bni-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spaceImg(space.img, 900)} alt={space.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <h1 className="text-xl font-extrabold">{space.name}</h1>
          <p className="mt-1 text-sm text-bni-body">{space.location} · 면적 {space.area}㎡ · 수용 {space.capacity}인</p>
          {space.description && <p className="mt-2 text-sm text-bni-body">{space.description}</p>}
          <p className="mt-3 font-extrabold text-bni-red">{won(space.hourly_price)}<span className="text-sm font-normal text-bni-body"> / 시간</span></p>
        </div>
      </div>

      {/* 달력 */}
      <section className="rounded-2xl border border-bni-line p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{MONTHS[viewM]} {viewY}</h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="h-8 w-8 rounded-lg border border-bni-line">‹</button>
            <button onClick={nextMonth} className="h-8 w-8 rounded-lg border border-bni-line">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-bni-body">
          {DOW.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const cellDate = new Date(viewY, viewM, d);
            const disabled = isDisabledDate(cellDate, today);
            const selected = date && ymd(date) === ymd(cellDate);
            return (
              <button
                key={i}
                disabled={disabled}
                onClick={() => { setDate(cellDate); setTime(null); }}
                className={`aspect-square rounded-lg text-sm ${
                  selected ? "bg-bni-red font-bold text-white"
                  : disabled ? "text-bni-line"
                  : "hover:bg-bni-red-soft"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      {/* 시간 */}
      {date && (
        <section className="rounded-2xl border border-bni-line p-5">
          <h2 className="mb-3 text-lg font-bold">시간 선택</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {BASE_SLOTS.map((slot) => {
              const bz = slotBusy(slot);
              const sel = time === slot;
              return (
                <button
                  key={slot}
                  disabled={bz}
                  onClick={() => setTime(slot)}
                  className={`rounded-lg border py-2 text-sm font-semibold ${
                    sel ? "border-bni-red bg-bni-red text-white"
                    : bz ? "border-bni-line bg-bni-soft text-bni-line line-through"
                    : "border-bni-line hover:border-bni-red hover:text-bni-red"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 옵션 */}
      {date && time && (
        <section className="rounded-2xl border border-bni-line p-5">
          <h2 className="mb-3 text-lg font-bold">이용 옵션</h2>
          <label className="mb-3 block text-sm font-semibold text-bni-body">이용 시간</label>
          <div className="mb-5 flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  duration === d ? "border-bni-red bg-bni-red text-white" : "border-bni-line hover:border-bni-red"
                }`}
              >
                {d}분
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm font-semibold text-bni-body">추가 옵션</label>
          <div className="grid gap-2">
            {SPACE_ADDONS.map((a) => {
              const on = addonIds.includes(a.id);
              return (
                <label key={a.id} className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 ${on ? "border-bni-red bg-bni-red-soft" : "border-bni-line"}`}>
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => setAddonIds((prev) => e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id))}
                    />
                    {a.name}
                  </span>
                  <span className="text-sm font-semibold">+{won(a.price)}</span>
                </label>
              );
            })}
          </div>

          <label className="mb-2 mt-5 block text-sm font-semibold text-bni-body">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="요청사항을 입력하세요"
            className="w-full rounded-lg border border-bni-line px-3 py-2 text-sm outline-none focus:border-bni-red"
          />

          <div className="mt-5 flex items-center justify-between">
            <span className="text-lg font-extrabold text-bni-red">{won(total)}</span>
            <button
              onClick={() => setConfirming(true)}
              className="h-12 rounded-xl bg-bni-ink px-8 font-bold text-white transition hover:opacity-90"
            >
              결제하기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
