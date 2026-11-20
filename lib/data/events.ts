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
  /** 가격. 통화는 currency(없으면 원화). 달러는 달러 단위 숫자(480 = USD 480.00). */
  price: number;
  /** 결제 통화. 국내용은 원화(KRW), 국외용은 달러(USD) — 토스 MID 가 통화별로 나뉜다. */
  currency?: "KRW" | "USD";
  /** 카페24 상품코드(출처 추적용) */
  sku?: string;
  /** 대표 이미지와 상세 이미지(public 아래 경로) */
  image?: string;
  detailImages?: string[];
  /** 티켓 카드 머리에 크게 쓰는 짧은 이름(대문자 표기). 없으면 name. */
  tier?: string;
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
export function currencyOf(ticket: EventTicket): "KRW" | "USD" {
  return ticket.currency ?? "KRW";
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
  /* ---- 랜딩페이지 내용(있는 것만 보여 준다). 사실로 확인된 것만 적는다. ---- */
  /** 행사 표어 */
  tagline?: string;
  /** 일정·장소 표기 */
  dateText?: { ko: string; en: string };
  venue?: { ko: string; en: string };
  /** Short uppercase date and city for the floating menu bar, e.g. "JUNE 1-2, 2026" / "SEOUL". */
  dateShort?: string;
  city?: string;
  /** Background video of the first scene (mp4 URL or a path under public). Muted, looped. */
  heroVideo?: string;
  /** 행사 시작 시각(ISO, +09:00). 미래일 때만 남은 시간을 보여 준다. */
  startsAt?: string;
  /** 한눈에 보기: 큰 글자 값 + 작은 설명 */
  stats?: { value: string; label: { ko: string; en: string } }[];
  /** 「이런 경험을 합니다」 항목 */
  highlights?: { ko: string; en: string }[];
  /** 자주 묻는 질문 */
  faq?: { q: { ko: string; en: string }; a: { ko: string; en: string } }[];
  /** 연사 라인업. 날짜별 묶음. keynote 는 큰 카드로 보여 준다. */
  speakers?: EventSpeakerDay[];
  /** Event Info 페이지: 구역(Arrival 등)마다 접었다 펴는 항목들. 답은 문단 배열. */
  info?: EventInfoSection[];
};

export type EventInfoSection = {
  id: string;
  /** 구역 제목. 첫 낱말은 굵게, 나머지는 가볍게 보여 준다. */
  title: { ko: string; en: string };
  items: { q: { ko: string; en: string }; a: { ko: string[]; en: string[] } }[];
};

export type EventSpeaker = {
  name: string;
  /** 역할 꼬리표(Keynote Speaker, Opening Speech, Member Success Story …) */
  role: string;
  /** 소속·직함(원문 그대로) */
  org: string;
  /** 강연 제목(정해지지 않았으면 비운다) */
  title?: string;
  keynote?: boolean;
  /** 사진 주소(없으면 글자 카드로 나온다) */
  photo?: string;
};
export type EventSpeakerDay = {
  day: { ko: string; en: string };
  theme: string;
  speakers: EventSpeaker[];
};

// nc26 은 2026-06-01~02 에 끝난 행사다(판매 마감 2026-05-28). 보관용으로만 싣는다.
// 가격 출처: nc26-bnikorea.com 티켓 페이지(국내 참가자 탭, 원화), 2026-11-20 확인.
// 다음 행사(nc27)는 일정·티켓·가격이 정해지면 status "on_sale" 로 추가한다.
export const EVENTS: EventInfo[] = [
  // ── 토스 결제창 심사용 테스트 상품(2026-11-20). 카페24에서 판매한 nc26 상품 5종을
  //    상품명·가격·대표 이미지·상세 이미지 그대로 옮겼다(원화몰 shop1 = 국내용, 영문몰 shop2 = 국외용).
  //    국내용은 원화 MID, 국외용은 달러 MID 로 결제한다. 심사가 끝나면 이 묶음을 지운다.
  //    출처: bnikorea88.cafe24.com 상품목록(상품명 Conference 검색) · global.bnikoreastore.com 상품 상세.
  {
    code: "conference",
    name: "2026 BNI Korea National Conference",
    nameKo: "2026 BNI Korea National Conference",
    year: 2026,
    status: "on_sale",
    // 아래 랜딩 내용의 출처: 카페24 영문몰 상품 상세 이미지(detail-conference.jpg)·대표 이미지.
    tagline: "Accelerate Your Success with BNI",
    dateText: { ko: "2026년 6월 1일(월) – 2일(화)", en: "June 1 (Mon) – June 2 (Tue), 2026" },
    venue: { ko: "스위스그랜드호텔 서울", en: "Swiss Grand Hotel, Seoul" },
    dateShort: "JUNE 1–2, 2026",
    city: "SEOUL",
    // Same background video the nc26 site used on its home (Mixkit stock, night road light trails).
    // Linked from the original address for now; host our own copy before going live.
    heroVideo: "https://assets.mixkit.co/videos/47649/47649-720.mp4",
    // Doors open 08:00 on June 1 (source: booth image "08:00 AM - 18:00 PM"). Already past: the countdown shows zeros.
    startsAt: "2026-06-01T08:00:00+09:00",
    // 숫자 출처: nc26-bnikorea.com 첫 화면(2일 · 800+ 참가자 · 10+ 연사 · 20+ 국가).
    stats: [
      { value: "2", label: { ko: "DAYS", en: "DAYS" } },
      { value: "800+", label: { ko: "ATTENDEES", en: "ATTENDEES" } },
      { value: "10+", label: { ko: "SPEAKERS", en: "SPEAKERS" } },
      { value: "20+", label: { ko: "COUNTRIES", en: "COUNTRIES" } },
    ],
    highlights: [
      { ko: "글로벌·국내 리더의 실제 성장 전략", en: "Real growth strategies from global and domestic leaders" },
      { ko: "실질적인 비즈니스 기회로 이어지는 구조화된 네트워킹", en: "Structured networking that leads to tangible business opportunities" },
      { ko: "전국 8개 지역의 우수 사례와 성과 하이라이트", en: "Best practices and performance highlights from 8 regions across Korea" },
      { ko: "탁월한 성과를 기리는 갈라 축하 행사", en: "A gala celebration recognizing outstanding achievements" },
    ],
    faq: [
      {
        q: { ko: "어떤 결제수단을 쓸 수 있나요?", en: "Which payment methods are accepted?" },
        a: {
          ko: "국내 참가자는 신용/체크카드, 간편결제, 계좌이체, 가상계좌로 원화(KRW) 결제를 합니다.",
          en: "International participants pay by card (Visa, Mastercard, JCB, AMEX). Prices are shown and charged in USD.",
        },
      },
      {
        q: { ko: "해외에서 참가합니다. 어떻게 결제하나요?", en: "I live in Korea. Can I pay in KRW?" },
        a: {
          ko: "위 티켓 영역에서 「International」 탭을 선택하면 해외 발급 카드로 달러(USD) 결제를 할 수 있습니다.",
          en: "Yes. Choose the 「국내 참가자」 tab in the ticket section to pay in KRW with Korean payment methods.",
        },
      },
    ],
    // Event Info: nc26-bnikorea.com 의 첫 화면·일정·티켓(자주 묻는 질문)·바닥글 원문에서 옮겼다. 영문은 번역.
    info: [
      {
        id: "arrival",
        title: { ko: "Arrival 오시는 길", en: "Arrival" },
        items: [
          {
            q: { ko: "일정과 등록 시간", en: "Dates & registration hours" },
            a: {
              ko: ["2026년 6월 1일(월) – 2일(화), 이틀간 진행합니다.", "Day 1 등록 및 부스 오픈: 08:00 – 09:00"],
              en: ["June 1 (Mon) – June 2 (Tue), 2026.", "Day 1 registration & booth opening: 08:00 – 09:00"],
            },
          },
          {
            q: { ko: "장소와 주소", en: "Venue address" },
            a: {
              ko: ["스위스그랜드호텔 서울 (Swiss Grand Hotel Seoul)", "서울 서대문구 연희로 353"],
              en: ["Swiss Grand Hotel Seoul", "353 Yeonhui-ro, Seodaemun-gu, Seoul"],
            },
          },
          {
            q: { ko: "현장 등록도 가능한가요?", en: "Can I register on site?" },
            a: {
              ko: ["사전 등록을 권장드리며, 잔여석이 있을 경우 현장 등록도 가능합니다. 현장 등록 시 추가 요금이 발생할 수 있습니다."],
              en: ["We recommend registering in advance. On-site registration is possible if seats remain, and an additional fee may apply."],
            },
          },
        ],
      },
      {
        id: "venue",
        title: { ko: "At the venue 현장 안내", en: "At the venue" },
        items: [
          {
            q: { ko: "프로그램", en: "Program" },
            a: {
              ko: ["DAY 1 · 6월 1일 (월) — Networking · Global · Gala", "DAY 2 · 6월 2일 (화) — Regions · Strategy · Awards", "연사와 강연 제목은 Speakers 페이지에서 볼 수 있습니다."],
              en: ["DAY 1 · June 1 (Mon) — Networking · Global · Gala", "DAY 2 · June 2 (Tue) — Regions · Strategy · Awards", "See the Speakers page for the lineup and talk titles."],
            },
          },
          {
            q: { ko: "네트워킹 파티", en: "Networking party" },
            a: {
              ko: ["Day 1 18:00 – 20:30 글로벌 네트워킹 파티 & DnA 어워드"],
              en: ["Day 1, 18:00 – 20:30: Global Networking Party & DnA Awards"],
            },
          },
          {
            q: { ko: "전시 부스", en: "Exhibition booths" },
            a: {
              ko: ["부스 크기 2m × 2m × 2.5m", "운영 시간: 6월 1 – 2일 08:00 – 18:00", "점심시간(12:00 – 13:30)에 확장 부스 투어가 있습니다."],
              en: ["Booth size: 2m × 2m × 2.5m", "Hours: June 1 – 2, 08:00 – 18:00", "An extended booth tour runs during lunch (12:00 – 13:30)."],
            },
          },
        ],
      },
      {
        id: "tickets-refund",
        title: { ko: "Tickets 티켓과 환불", en: "Tickets & refunds" },
        items: [
          {
            q: { ko: "세금계산서 발행이 가능한가요?", en: "Can I get a tax invoice?" },
            a: {
              ko: ["네, 가상계좌 입금을 선택하신 뒤 '현금영수증' 발행을 선택하시고 사업자 등록 정보를 입력하시면 전자세금계산서가 발행됩니다."],
              en: ["Yes. Choose virtual account payment, select the cash receipt option, and enter your business registration details. An electronic tax invoice will be issued."],
            },
          },
          {
            q: { ko: "티켓 환불 규정", en: "Ticket refund policy" },
            a: {
              ko: ["5/11까지 취소 요청 시: 티켓 금액의 100% 환불", "5/18까지 취소 요청 시: 티켓 금액의 50% 환불", "5/28까지 취소 요청 시: 티켓 금액의 30% 환불", "5/29부터: 환불 불가"],
              en: ["Cancel by May 11: 100% refund", "Cancel by May 18: 50% refund", "Cancel by May 28: 30% refund", "From May 29: no refund"],
            },
          },
          {
            q: { ko: "행사 부스 환불 규정", en: "Booth refund policy" },
            a: {
              ko: ["5/11까지 취소 요청 시: 부스 참가비의 90% 환불", "5/18까지 취소 요청 시: 부스 참가비의 70% 환불", "5/25까지 취소 요청 시: 부스 참가비의 50% 환불", "5/28까지 취소 요청 시: 부스 참가비의 20% 환불", "5/29부터: 환불 불가", "전기, 집기, 추가 비품, 홍보물 제작 등 이미 발주되었거나 비용이 발생한 항목은 실비가 별도 차감될 수 있습니다."],
              en: ["Cancel by May 11: 90% refund", "Cancel by May 18: 70% refund", "Cancel by May 25: 50% refund", "Cancel by May 28: 20% refund", "From May 29: no refund", "Costs already incurred for options such as electricity, furniture, extra equipment or printed materials may be deducted."],
            },
          },
          {
            q: { ko: "환불 접수 기준", en: "How refunds are processed" },
            a: {
              ko: ["환불 기준일은 취소 요청이 정상 접수된 일자를 기준으로 합니다.", "취소 및 환불 접수는 업무일 기준 오전 9시부터 오후 6시까지 가능하며, 내셔널 오피스를 통해 접수해 주시기 바랍니다.", "업무시간 외, 주말 및 공휴일 접수 건은 다음 업무일 오전 9시 접수 건으로 처리됩니다.", "결제 수단에 따라 승인 취소 및 실제 환불 완료 시점은 다소 차이가 있을 수 있습니다."],
              en: ["The refund rate is based on the date your cancellation request is properly received.", "Requests are accepted on business days from 9:00 to 18:00 through the National Office.", "Requests received outside business hours, on weekends or on public holidays are treated as received at 9:00 on the next business day.", "The time until the refund is completed may vary by payment method."],
            },
          },
        ],
      },
      {
        id: "contact",
        title: { ko: "Contact 문의와 도움", en: "Contact & help" },
        items: [
          {
            q: { ko: "문의처", en: "Contact" },
            a: {
              ko: ["이메일: admin@bni-korea.com", "전화: 02-6261-8838", "내셔널 오피스 업무시간: 업무일 오전 9시 – 오후 6시"],
              en: ["Email: admin@bni-korea.com", "Phone: +82-2-6261-8838", "National Office hours: business days, 9:00 – 18:00 (KST)"],
            },
          },
          {
            q: { ko: "결제 수단", en: "Payment methods" },
            a: {
              ko: ["국내 참가자: 신용/체크카드, 간편결제, 계좌이체, 가상계좌 (원화 결제)", "해외 참가자: 티켓 영역의 「International」 탭에서 해외 발급 카드로 결제 (달러 결제)"],
              en: ["International participants: Visa, Mastercard, JCB, AMEX. Prices are shown and charged in USD.", "Participants in Korea: choose the 「국내 참가자」 tab to pay in KRW with Korean payment methods."],
            },
          },
        ],
      },
    ],
    // 연사: nc26-bnikorea.com/speakers.html 원문 그대로(2026-11-20 보관본). 사진은 그 사이트의 주소에서 불러온다.
    speakers: [
      {
        day: { ko: "DAY 1 · 6월 1일 (월)", en: "DAY 1 · June 1 (Mon)" },
        theme: "Networking · Global",
        speakers: [
          { keynote: true, role: "Keynote Speaker", name: "김하원", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-kim-hawon.jpg", org: "주식회사 해녀키친그룹 대표이사", title: "From Jeju Local to the World Stage — 제주 로컬의 이야기가 세계인의 무대에 오르다" },
          { role: "Opening Speech", name: "존윤", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/host-john-yoon.png", org: "BNI Korea National Director & CEO", title: "협업의 힘으로 비즈니스를 가속하라" },
          { role: "Member Success Story", name: "정명수", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-jeong-ms-4.jpeg", org: "㈜에어컨설팅 대표 · 부산 파이오니아", title: "에어컨 대표가 BNI에서 가져온 것들" },
          { role: "Member Success Story", name: "김정규", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-kim-jk.jpeg", org: "법무법인 한수 파트너 · 강남 Director", title: "1인 변호사에서 글로벌 사업가로 성장" },
          { role: "Member Success Story", name: "김태현", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-kim-th.jpg", org: "통달한의원 대표원장 · 영등포 시너지", title: "Giver's Gain으로 만든 글로벌 연결" },
          { role: "Global Story", name: "Alex P.E.", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-alex-pe.png", org: "Woodlands · Kowloon Energy", title: "My Gateway to Growth — BNI — 나의 성장 관문, BNI" },
          { role: "Global Story", name: "Eric Chan", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-eric-chan.png", org: "Deepsea Marine HK · Kowloon Zenith", title: "Make People Remember You — 사람들에게 기억되는 네트워커가 되는 법" },
          { role: "Special Speech Ⅰ", name: "Hironori Fujimoto", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-fujimoto.jpg", org: "BNI Nagoya Region Area Director" },
        ],
      },
      {
        day: { ko: "DAY 2 · 6월 2일 (화)", en: "DAY 2 · June 2 (Tue)" },
        theme: "Regions · Strategy · Chapter",
        speakers: [
          { keynote: true, role: "Keynote Ⅰ", name: "Judee R. Quiazon", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-philippines-ed.png", org: "BNI Taguig Region · Executive Director", title: "The Culture That Built the Billions — 수십억을 만든 문화의 힘" },
          { keynote: true, role: "Keynote Ⅱ", name: "Mac Srinivasan", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/speaker-mac-card.jpg", org: "CEO, The Abundant Group · Former BNI Global Markets President", title: "Creating High Performance Teams — 고성과 팀을 만드는 법" },
          { role: "Special Speech Ⅱ", name: "Asato Ohno", photo: "https://www.nc26-bnikorea.com/%EC%8A%A4%ED%94%BC%EC%BB%A4%20%EC%9D%B4%EB%AF%B8%EC%A7%80/asato-ohno.jpg", org: "BNI Japan National Director · JBN International 대표", title: "Changing the Way the World Does Business — 소개(리퍼럴)가 비즈니스의 미래다" },
          { role: "Regional Presentations", name: "지역 발표", org: "전국 8개 지역의 성과 & 실행 사례" },
        ],
      },
    ],
    tickets: [
      // 국내용 — 원화(KRW). 카페24 한국어몰 판매가.
      {
        id: "ed-kr", tier: "ED", features: [{ ko: "컨퍼런스 + 네트워킹 파티", en: "Conference + Networking Party" }, { ko: "Day 1–2 참가", en: "Day 1–2" }], sku: "P0000BDJ", audience: "domestic", currency: "KRW", price: 385000, maxQuantity: 10,
        name: "2026 BNI Korea National Conference_for ED", nameKo: "2026 BNI Korea National Conference_for ED",
        image: "/event/nc26/main-ko.png",
      },
      {
        id: "director-member-kr", tier: "DIRECTOR & MEMBER", features: [{ ko: "컨퍼런스 + 네트워킹 파티", en: "Conference + Networking Party" }, { ko: "Day 1–2 참가", en: "Day 1–2" }], sku: "P0000BDK", audience: "domestic", currency: "KRW", price: 385000, maxQuantity: 10,
        name: "2026 BNI Korea National Conference_for Director & Member", nameKo: "2026 BNI Korea National Conference_for Director & Member",
        image: "/event/nc26/main-ko.png",
      },
      {
        id: "booth-kr", tier: "EXHIBITION BOOTH", features: [{ ko: "부스 크기 2m × 2m × 2.5m", en: "Booth size 2m × 2m × 2.5m" }, { ko: "6월 1–2일 08:00–18:00", en: "June 1–2, 08:00 AM – 18:00 PM" }], sku: "P0000BEA", audience: "domestic", currency: "KRW", price: 1500000, maxQuantity: 2,
        name: "Exhibition Booth : BNI KOREA National Conference 2026", nameKo: "Exhibition Booth : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-ko.png",
      },
      {
        id: "visitor-kr", tier: "VISITOR", features: [{ ko: "Day 1 참가 (점심 포함)", en: "Day 1 (lunch included)" }], sku: "P0000BFF", audience: "domestic", currency: "KRW", price: 250000, maxQuantity: 10,
        name: "Visitor Pass : BNI KOREA National Conference 2026", nameKo: "Visitor Pass : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-ko.png",
      },
      {
        id: "visitor-networking-kr", tier: "VISITOR + NETWORKING", features: [{ ko: "Day 1 참가 (점심 포함)", en: "Day 1 (lunch included)" }, { ko: "네트워킹 파티", en: "Networking Party" }], sku: "P0000BFG", audience: "domestic", currency: "KRW", price: 450000, maxQuantity: 10,
        name: "Visitor + Networking Pass : BNI KOREA National Conference 2026", nameKo: "Visitor + Networking Pass : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-ko.png",
      },
      // 국외용 — 달러(USD). 카페24 영문몰 판매가.
      {
        id: "ed-intl", tier: "ED", features: [{ ko: "컨퍼런스 + 네트워킹 파티", en: "Conference + Networking Party" }, { ko: "Day 1–2 참가", en: "Day 1–2" }], sku: "P0000BDJ", audience: "international", currency: "USD", price: 480, maxQuantity: 10,
        name: "2026 BNI Korea National Conference_for ED", nameKo: "2026 BNI Korea National Conference_for ED",
        image: "/event/nc26/main-ed.png", detailImages: ["/event/nc26/detail-conference.jpg"],
      },
      {
        id: "director-member-intl", tier: "DIRECTOR & MEMBER", features: [{ ko: "컨퍼런스 + 네트워킹 파티", en: "Conference + Networking Party" }, { ko: "Day 1–2 참가", en: "Day 1–2" }], sku: "P0000BDK", audience: "international", currency: "USD", price: 360, maxQuantity: 10,
        name: "2026 BNI Korea National Conference_for Director & Member", nameKo: "2026 BNI Korea National Conference_for Director & Member",
        image: "/event/nc26/main-director-member.png", detailImages: ["/event/nc26/detail-conference.jpg"],
      },
      {
        id: "booth-intl", tier: "EXHIBITION BOOTH", features: [{ ko: "부스 크기 2m × 2m × 2.5m", en: "Booth size 2m × 2m × 2.5m" }, { ko: "6월 1–2일 08:00–18:00", en: "June 1–2, 08:00 AM – 18:00 PM" }], sku: "P0000BEA", audience: "international", currency: "USD", price: 1500, maxQuantity: 2,
        name: "Exhibition Booth : BNI KOREA National Conference 2026", nameKo: "Exhibition Booth : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-booth.png",
        detailImages: ["/event/nc26/detail-booth-1.jpg", "/event/nc26/detail-booth-2.jpg", "/event/nc26/detail-booth-3.jpg"],
      },
      {
        id: "visitor-intl", tier: "VISITOR", features: [{ ko: "Day 1 참가 (점심 포함)", en: "Day 1 (lunch included)" }], sku: "P0000BFF", audience: "international", currency: "USD", price: 190, maxQuantity: 10,
        name: "Visitor Pass : BNI KOREA National Conference 2026", nameKo: "Visitor Pass : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-visitor.png", detailImages: ["/event/nc26/detail-visitor.jpg"],
      },
      {
        id: "visitor-networking-intl", tier: "VISITOR + NETWORKING", features: [{ ko: "Day 1 참가 (점심 포함)", en: "Day 1 (lunch included)" }, { ko: "네트워킹 파티", en: "Networking Party" }], sku: "P0000BFG", audience: "international", currency: "USD", price: 245, maxQuantity: 10,
        name: "Visitor + Networking Pass : BNI KOREA National Conference 2026", nameKo: "Visitor + Networking Pass : BNI KOREA National Conference 2026",
        image: "/event/nc26/main-visitor-networking.png", detailImages: ["/event/nc26/detail-visitor-networking.jpg"],
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
