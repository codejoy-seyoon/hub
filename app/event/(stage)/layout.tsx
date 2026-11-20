import Link from "next/link";
import { headers } from "next/headers";
import { eventBaseFromHost, eventPath } from "@/lib/data/events";

export const metadata = {
  title: "BNI Event | BNI Korea 공식 행사",
  description: "BNI Korea 공식 행사 안내와 티켓 결제",
};

// 행사 무대 화면(행사 첫 화면·연사 페이지)의 틀. slush.org 처럼 화면 전체가 어두운 바탕이고,
// 흰 머리글 없이 떠 있는 메뉴 바(EventSubnav)가 맨 위에 온다.
// 주문·결제, 상품 상세, 행사 목록은 (site) 묶음의 흰 틀을 쓴다.
export default async function EventStageLayout({ children }: { children: React.ReactNode }) {
  const base = eventBaseFromHost((await headers()).get("host"));
  return (
    <div className="flex min-h-screen flex-col bg-[#18181a] text-white">
      {/* 길쭉한 제목 글꼴(티켓 이름·날짜). 한글에는 적용되지 않고 본문 글꼴로 나온다. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
        precedence="default"
      />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-10 text-xs leading-6 text-white/50 sm:px-10">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-white/80">BNI Korea Event</p>
            <p>BNI Korea 공식 행사 안내와 티켓 결제 · Official BNI Korea events and ticketing</p>
          </div>
          <Link href={eventPath(base)} className="font-bold uppercase tracking-[0.2em] hover:text-white">
            행사 목록 · All events
          </Link>
        </div>
      </footer>
    </div>
  );
}
