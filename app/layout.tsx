import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BNI Korea Hub | THE REAL MBA",
  description: "BNI Korea 통합 허브 — 스토어 · 대관 예약 · 트레이닝 · 이북",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-bni-ink antialiased">
        {children}
      </body>
    </html>
  );
}
