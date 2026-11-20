import Link from "next/link";
import { eventPath } from "@/lib/data/events";
import { BniBrandLogo, BRAND_HEADER_HEIGHT_CLASS } from "@/components/brand/BniBrandLogo";

/** BNI Event 공통 틀(머리글·바닥글). base 는 주소 앞부분("" 또는 "/event"). */
export function EventShell({ base, children }: { base: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-bni-ink">
      <header className="border-b border-bni-line">
        <div className={`mx-auto flex max-w-5xl items-center justify-between px-5 ${BRAND_HEADER_HEIGHT_CLASS}`}>
          <Link href={eventPath(base)} className="block flex-none" aria-label="BNI Event 홈">
            <BniBrandLogo name="event" />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link href={eventPath(base)} className="hover:text-bni-red">
              행사 목록 · Events
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-bni-line">
        <div className="mx-auto max-w-5xl px-5 py-8 text-xs leading-6 text-bni-body">
          <p className="font-semibold text-bni-ink">BNI Korea Event</p>
          <p>BNI Korea 공식 행사 안내와 티켓 결제 · Official BNI Korea events and ticketing</p>
        </div>
      </footer>
    </div>
  );
}
