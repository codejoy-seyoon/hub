import { headers } from "next/headers";
import { EventShell } from "@/components/event/EventShell";
import { eventBaseFromHost } from "@/lib/data/events";

export const metadata = {
  title: "BNI Event | BNI Korea 공식 행사",
  description: "BNI Korea 공식 행사 안내와 티켓 결제",
};

export default async function EventLayout({ children }: { children: React.ReactNode }) {
  const base = eventBaseFromHost((await headers()).get("host"));
  return <EventShell base={base}>{children}</EventShell>;
}
