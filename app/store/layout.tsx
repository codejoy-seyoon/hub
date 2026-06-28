import "./store-theme.css";
import { StoreNav } from "@/components/store/StoreNav";
import { StoreFooter } from "@/components/store/StoreFooter";
import { BackToTop } from "@/components/store/BackToTop";

export const metadata = {
  title: "BNI KOREA STORE | 공식 굿즈 스토어",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lv-page">
      {/* 부티크 전용 폰트 + 아이콘 (Bootstrap Icons는 아이콘 폰트만 로드) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
      />

      <div className="top-bar">
        <span>BNI KOREA 공식 굿즈 스토어 · 5만원 이상 무료배송</span>
      </div>

      <StoreNav />
      {children}
      <StoreFooter />
      <BackToTop />
    </div>
  );
}
