/* legacy/shared/data.js 의 2026년 6월 일정 데이터 (어드민 공유 레이어 계승) */

export type CalEvent = { id: string; day: number; title: string; color: string };
export type DayTraining = {
  id: string;
  day: number;
  title: string;
  chapter: string;
  who: string;
  time: string;
  status: string;
  img: string;
};

export const EVENTS: CalEvent[] = [
  { id: "e1", day: 1, title: "마포 챕터 미팅", color: "c-red" },
  { id: "e2", day: 1, title: "코칭타운 정기 코칭", color: "c-blue" },
  { id: "e3", day: 2, title: "영등포 1:1 미팅", color: "c-green" },
  { id: "e4", day: 2, title: "서초 오리엔테이션", color: "c-purple" },
  { id: "e5", day: 2, title: "COO 주간 회의", color: "c-gray" },
  { id: "e6", day: 3, title: "주간 뉴스레터 발송", color: "c-gray" },
  { id: "e7", day: 4, title: "수원1 멤버데이", color: "c-red" },
  { id: "e8", day: 4, title: "코칭타운", color: "c-blue" },
  { id: "e9", day: 5, title: "주간 결산 미팅", color: "c-blue" },
  { id: "e10", day: 8, title: "리더십 트레이닝", color: "c-purple" },
  { id: "e11", day: 8, title: "생일: 박멤버", color: "c-green dotstyle" },
  { id: "e12", day: 9, title: "마포 멤버 트레이닝", color: "c-red" },
  { id: "e13", day: 9, title: "영등포 미팅", color: "c-green" },
  { id: "e14", day: 9, title: "COO 회의", color: "c-gray" },
  { id: "e15", day: 10, title: "코칭타운 코칭", color: "c-blue" },
  { id: "e16", day: 11, title: "네트워킹 세미나", color: "c-green" },
  { id: "e17", day: 11, title: "대한민국의 휴일 점검", color: "c-purple dotstyle" },
  { id: "e18", day: 12, title: "주간 결산", color: "c-blue" },
  { id: "e19", day: 14, title: "Equity Asia for HQ", color: "c-mag" },
  { id: "e20", day: 15, title: "NOM 정기 National Conference", color: "c-mag" },
  { id: "e21", day: 15, title: "챕터 합동 트레이닝", color: "c-purple" },
  { id: "e22", day: 16, title: "BNI Philippines National Conf.", color: "c-mag" },
  { id: "e23", day: 16, title: "신규 멤버 교육", color: "c-red" },
  { id: "e24", day: 17, title: "APEX NOVO Summit (Philippines)", color: "c-mag" },
  { id: "e25", day: 17, title: "코칭타운", color: "c-blue" },
  { id: "e26", day: 18, title: "한국지사대표 컨퍼런스 참여", color: "c-mag" },
  { id: "e27", day: 18, title: "비즈니스 발표회", color: "c-blue" },
  { id: "e28", day: 19, title: "BNI Taiwan National Conference", color: "c-mag" },
  { id: "e29", day: 22, title: "서초 챕터 미팅", color: "c-red" },
  { id: "e30", day: 22, title: "대외 홍보전략 회의", color: "c-blue" },
  { id: "e31", day: 22, title: "COO 회의", color: "c-gray" },
  { id: "e32", day: 23, title: "리더 워크숍", color: "c-purple" },
  { id: "e33", day: 24, title: "코칭타운 코칭", color: "c-blue" },
  { id: "e34", day: 25, title: "수원1 멤버 트레이닝", color: "c-red" },
  { id: "e35", day: 25, title: "생일: 김디렉터", color: "c-green dotstyle" },
  { id: "e36", day: 26, title: "BNI Taiwan National Conference", color: "c-mag" },
  { id: "e37", day: 29, title: "월말 결산 미팅", color: "c-green" },
  { id: "e38", day: 30, title: "대표 면담", color: "c-gray" },
  { id: "e39", day: 30, title: "7월 일정 준비", color: "c-navy" },
];

export const DAY_TRAININGS: DayTraining[] = [
  { id: "t1", day: 1, title: "마포 챕터 미팅", chapter: "마포 챕터", who: "김지훈 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1517245386807-bb43f82c33c4" },
  { id: "t2", day: 2, title: "영등포 1:1 미팅", chapter: "영등포 챕터", who: "박서연 트레이너", time: "14:00 – 15:30", status: "모집중", img: "photo-1600880292203-757bb62b4baf" },
  { id: "t3", day: 2, title: "서초 오리엔테이션", chapter: "서초 챕터", who: "이정민 디렉터", time: "19:00 – 21:00", status: "모집중", img: "photo-1573164713988-8665fc963095" },
  { id: "t4", day: 4, title: "수원1 멤버데이", chapter: "수원1 챕터", who: "정하늘 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1559136555-9303baea8ebd" },
  { id: "t5", day: 8, title: "리더십 트레이닝", chapter: "코리아 본부", who: "최우진 대표 트레이너", time: "10:00 – 13:00", status: "모집중", img: "photo-1542744094-3a31f272c490" },
  { id: "t6", day: 9, title: "마포 멤버 트레이닝", chapter: "마포 챕터", who: "김지훈 디렉터", time: "07:00 – 09:00", status: "진행중", img: "photo-1556761175-5973dc0f32e7" },
  { id: "t7", day: 9, title: "영등포 미팅", chapter: "영등포 챕터", who: "박서연 트레이너", time: "14:00 – 15:30", status: "모집중", img: "photo-1521737604893-d14cc237f11d" },
  { id: "t8", day: 11, title: "네트워킹 세미나", chapter: "코리아 본부", who: "한지윤 매니저", time: "18:30 – 20:30", status: "모집중", img: "photo-1551836022-d5d88e9218df" },
  { id: "t9", day: 15, title: "챕터 합동 트레이닝", chapter: "합동 4개 챕터", who: "최우진 대표 트레이너", time: "09:00 – 12:00", status: "모집중", img: "photo-1552664730-d307ca884978" },
  { id: "t10", day: 16, title: "신규 멤버 교육", chapter: "마포 챕터", who: "김지훈 디렉터", time: "19:00 – 21:00", status: "모집중", img: "photo-1517048676732-d65bc937f952" },
  { id: "t11", day: 18, title: "비즈니스 발표회", chapter: "서초 챕터", who: "이정민 디렉터", time: "14:00 – 16:00", status: "모집중", img: "photo-1475721027785-f74eccf877e2" },
  { id: "t12", day: 22, title: "서초 챕터 미팅", chapter: "서초 챕터", who: "이정민 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1591115765373-5207764f72e7" },
  { id: "t13", day: 23, title: "리더 워크숍", chapter: "코리아 본부", who: "최우진 대표 트레이너", time: "10:00 – 13:00", status: "모집중", img: "photo-1454165804606-c3d57bc86b40" },
  { id: "t14", day: 25, title: "수원1 멤버 트레이닝", chapter: "수원1 챕터", who: "정하늘 디렉터", time: "07:00 – 09:00", status: "모집중", img: "photo-1556157382-97eda2d62296" },
  { id: "t15", day: 29, title: "월말 결산 미팅", chapter: "코리아 본부", who: "한지윤 매니저", time: "18:00 – 20:00", status: "마감임박", img: "photo-1517502884422-41eaead166d4" },
];

export function eventsByDay(): Record<number, [string, string][]> {
  const map: Record<number, [string, string][]> = {};
  for (const e of EVENTS) (map[e.day] ??= []).push([e.title, e.color]);
  return map;
}

export function trainingsByDay(): Record<number, DayTraining[]> {
  const map: Record<number, DayTraining[]> = {};
  for (const t of DAY_TRAININGS) (map[t.day] ??= []).push(t);
  return map;
}
