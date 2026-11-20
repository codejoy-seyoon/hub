/* ============================================================
   BNI Event — 이벤트 허브(event.bnikorea.com) 행사 목록
   - 행사 하나 = 코드 하나(약칭+연도 두 자리). 주소는 event.bnikorea.com/<코드>
   - 페이지 내용과 판매 정보를 나눈다. 여기에는 판매 정보(티켓·가격·상태)만 둔다.
   - 행사가 끝나도 항목을 지우지 않는다(주소를 살려 두고 구매만 끈다).
   ============================================================ */

export type EventStatus =
  | "upcoming" // 예정: 안내만, 구매 꺼짐
  | "on_sale" // 판매 중
  | "sold_out" // 판매 마감
  | "ended"; // 종료(보관)

export type EventTicket = {
  id: string;
  /** 결제창·영수증에 찍히는 이름(영문) */
  name: string;
  /** 화면에 함께 보여 주는 한글 이름 */
  nameKo: string;
  /** 원화 가격. 국내결제·해외카드 모두 이 금액으로 결제한다. */
  price: number;
  /** 한 주문에서 살 수 있는 최대 수량 */
  maxQuantity: number;
  /** 누구에게 파는 상품인가. 국내용은 국내 결제수단, 국외용은 해외카드 결제창(영문)이 뜬다. 없으면 국내용. */
  audience?: EventAudience;
  /** 가격 카드에 보여 줄 한 줄 설명과 포함 내역(국문/영문). ok=false 는 「불포함」 표시. */
  summary?: { ko: string; en: string };
  features?: { ko: string; en: string; ok?: boolean }[];
};

export type EventAudience = "domestic" | "international";
export function audienceOf(ticket: EventTicket): EventAudience {
  return ticket.audience ?? "domestic";
}

export type EventInfo = {
  code: string;
  name: string;
  nameKo: string;
  year: number;
  status: EventStatus;
  /** 이 날짜(한국 시간, YYYY-MM-DD)가 지나면 status 와 상관없이 구매가 꺼진다. 미정이면 비워 둔다. */
  salesEndDate?: string;
  tickets: EventTicket[];
};

// nc26 은 2026-06-01~02 에 끝난 행사다(판매 마감 2026-05-28). 보관용으로만 싣는다.
// 가격 출처: nc26-bnikorea.com 티켓 페이지(국내 참가자 탭, 원화), 2026-11-20 확인.
// 다음 행사(nc27)는 일정·티켓·가격이 정해지면 status "on_sale" 로 추가한다.
export const EVENTS: EventInfo[] = [
  // ── 토스 결제창 심사용 임시 상품(2026-11-20). 실제 행사 티켓이 아니다.
  //    가격은 토스에 알린 수준(티켓 38만 원대·부스 150만 원대)에 맞췄다. 심사가 끝나면 이 묶음을 지운다.
  {
    code: "conference",
    name: "BNI Korea National Conference",
    nameKo: "BNI 코리아 내셔널 컨퍼런스",
    year: 2027,
    status: "on_sale",
    tickets: [
      // 국내용 — 국내 결제(신용카드·계좌이체·가상계좌)
      {
        id: "ticket-kr", audience: "domestic", name: "Conference Ticket", nameKo: "컨퍼런스 참가 티켓", price: 380000, maxQuantity: 10,
        summary: { ko: "컨퍼런스 + 네트워킹 파티 포함", en: "Conference + Networking Party" },
        features: [
          { ko: "컨퍼런스 참석", en: "Conference Access" },
          { ko: "네트워킹 파티", en: "Networking Party" },
          { ko: "Day 1–2 참가", en: "Day 1–2 Included" },
        ],
      },
      {
        id: "booth-kr", audience: "domestic", name: "Exhibition Booth", nameKo: "부스 전시", price: 1500000, maxQuantity: 2,
        summary: { ko: "Exhibition Booth (2m × 2m × 2.5m)", en: "Booth size: 2m × 2m × 2.5m" },
        features: [
          { ko: "상단 간판 디자인·설치", en: "Top sign design & installation" },
          { ko: "프로그램북 광고 게재", en: "Program book advertisement" },
        ],
      },
      // 국외용 — 해외 발급 카드(Visa·Mastercard 등), 원화 같은 금액
      {
        id: "ticket-intl", audience: "international", name: "Conference Ticket", nameKo: "컨퍼런스 참가 티켓 (국외용)", price: 380000, maxQuantity: 10,
        summary: { ko: "컨퍼런스 + 네트워킹 파티 포함", en: "Conference + Networking Party" },
        features: [
          { ko: "컨퍼런스 참석", en: "Conference Access" },
          { ko: "네트워킹 파티", en: "Networking Party" },
          { ko: "Day 1–2 참가", en: "Day 1–2 Included" },
        ],
      },
      {
        id: "booth-intl", audience: "international", name: "Exhibition Booth", nameKo: "부스 전시 (국외용)", price: 1500000, maxQuantity: 2,
        summary: { ko: "Exhibition Booth (2m × 2m × 2.5m)", en: "Booth size: 2m × 2m × 2.5m" },
        features: [
          { ko: "상단 간판 디자인·설치", en: "Top sign design & installation" },
          { ko: "프로그램북 광고 게재", en: "Program book advertisement" },
        ],
      },
    ],
  },
  {
    code: "nc26",
    name: "BNI Korea National Conference 2026 — Accelerate",
    nameKo: "제11회 BNI 코리아 내셔널 컨퍼런스 (2026.6.1–2, 스위스그랜드호텔 서울)",
    year: 2026,
    status: "ended",
    salesEndDate: "2026-05-28",
    tickets: [
      { id: "ed", name: "Executive Director Pass", nameKo: "컨퍼런스 + 네트워킹 파티", price: 660000, maxQuantity: 10 },
      { id: "director", name: "Director Pass", nameKo: "컨퍼런스 + 네트워킹 파티", price: 495000, maxQuantity: 10 },
      { id: "member", name: "BNI K. Member Pass", nameKo: "컨퍼런스", price: 418000, maxQuantity: 10 },
      { id: "visitor", name: "Visitor Pass", nameKo: "Day 1 (점심 포함)", price: 209000, maxQuantity: 10 },
      { id: "party", name: "Networking Party Pass", nameKo: "네트워킹 파티", price: 88000, maxQuantity: 10 },
      { id: "booth", name: "Exhibition Booth", nameKo: "부스 전시 (2m × 2m × 2.5m)", price: 2200000, maxQuantity: 2 },
    ],
  },
];

export function getEvent(code: string): EventInfo | undefined {
  return EVENTS.find((e) => e.code === code);
}

export function getTicket(code: string, ticketId: string): EventTicket | undefined {
  return getEvent(code)?.tickets.find((t) => t.id === ticketId);
}

/** 지금 구매를 받을 수 있는가. 종료일이 지나면 자동으로 꺼진다. */
export function isOnSale(event: EventInfo, now: Date = new Date()): boolean {
  if (event.status !== "on_sale") return false;
  if (!event.salesEndDate) return true;
  // 한국 시간 기준 종료일의 마지막 순간까지 판매
  const end = new Date(`${event.salesEndDate}T23:59:59+09:00`);
  return now.getTime() <= end.getTime();
}

export const EVENT_STATUS_LABEL: Record<EventStatus, { ko: string; en: string }> = {
  upcoming: { ko: "예정", en: "Coming soon" },
  on_sale: { ko: "판매 중", en: "On sale" },
  sold_out: { ko: "판매 마감", en: "Sales closed" },
  ended: { ko: "종료된 행사", en: "Past event" },
};

/* ---------- 주소 ---------- */
// event.bnikorea.com 으로 들어오면 주소에서 "/event" 를 뗀다(next.config.ts 의 host 규칙).
// 그 밖의 주소(로컬 등)에서는 "/event" 를 붙인다.
export const EVENT_HOST = "event.bnikorea.com";

export function eventBaseFromHost(host: string | null | undefined): string {
  return (host ?? "").toLowerCase().startsWith("event.") ? "" : "/event";
}

export function eventPath(base: string, path = ""): string {
  return `${base}${path}` || "/";
}
