import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eventBaseFromHost, getEvent, isOnSale } from "@/lib/data/events";
import { EventCheckoutClient } from "./EventCheckoutClient";

export const metadata = { title: "주문/결제 | BNI Event" };

export default async function EventCheckoutPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const event = getEvent(code);
  if (!event) notFound();
  const base = eventBaseFromHost((await headers()).get("host"));

  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-12" />}>
      <EventCheckoutClient eventCode={event.code} base={base} onSale={isOnSale(event)} />
    </Suspense>
  );
}
