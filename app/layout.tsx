import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "BNI KOREA HUB",
  description: "BNI Korea 통합 허브 — 스토어 · 대관 예약 · 트레이닝 · 이북",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-bni-ink antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
