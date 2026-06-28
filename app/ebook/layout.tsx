import "./ebook-theme.css";
import { PagelyNav } from "@/components/ebook/PagelyNav";
import { PagelyFooter } from "@/components/ebook/PagelyFooter";

export const metadata = { title: "Pagely — BNI eBook Store" };

export default function EbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pg-page">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
      />
      <div className="announcement-bar">
        🎉 신규 가입 시 첫 달 무료 · 전자책 30만 권 보유
      </div>
      <PagelyNav />
      {children}
      <PagelyFooter />
    </div>
  );
}
