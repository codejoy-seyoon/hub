import "./store-theme.css";
import { StoreNav } from "@/components/store/StoreNav";
import { StoreFooter } from "@/components/store/StoreFooter";
import { BackToTop } from "@/components/store/BackToTop";
export const metadata = { title: "BNI STORE | 멤버와 챕터를 위한 공식 스토어" };
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lv-page">
      <a className="store-skip-link" href="#store-main">본문으로 바로가기</a>
      <StoreNav />
      {children}
      <StoreFooter />
      <BackToTop />
    </div>
  );
}
