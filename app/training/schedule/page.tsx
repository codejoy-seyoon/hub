import "./schedule.css";
import { ScheduleCalendar } from "./ScheduleCalendar";

export const metadata = { title: "BNI 코리아 | Schedule — 2026년 6월" };

const SHORTCUTS = ["마포", "영등포", "서초", "수원1", "성남", "대구"];

export default function SchedulePage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        rel="stylesheet"
      />
      <div className="cal-page">
        <ScheduleCalendar />

        {/* 트레이닝 바로가기 */}
        <section>
          <div className="shortcuts">
            {SHORTCUTS.map((s) => (
              <a key={s} className="shortcut" href="/training">
                <div className="l1">
                  <b>BNI</b> {s}
                </div>
                <div className="l2">트레이닝 바로가기</div>
                <span className="arrow">바로가기 →</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
