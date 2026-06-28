import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatFab } from "@/components/ChatFab";

/* 홈·트레이닝·주문 등 허브 페이지의 빨간 BNI 글로벌 셸 */
export function HubShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <ChatFab />
    </>
  );
}
