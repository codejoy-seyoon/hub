import Link from "next/link";
import { storeHref } from "@/lib/storefront";
export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-wrap">
        <div className="store-footer-main">
          <div><Link href="/store" className="store-footer-brand">BNI STORE<span>공식 스토어</span></Link><p>멤버와 챕터를 위한 공식 스토어.<br />BNI 활동에 필요한 물품을 만나보세요.</p></div>
          <div><h2>쇼핑하기</h2><Link href={storeHref()}>전체 상품</Link><Link href={storeHref("gift")}>웰컴팩</Link><Link href={storeHref("sets")}>세트 상품</Link></div>
          <div><h2>이용 안내</h2><Link href="/orders">주문 조회</Link><span>배송비 3,000원</span><span>5만 원 이상 무료배송</span></div>
          <div><h2>BNI와 함께</h2><Link href="/">BNI 허브 ↗</Link><Link href="/training">트레이닝</Link><Link href="/ebook">전자책</Link></div>
        </div>
        <div className="store-footer-bottom"><span>© 2026 BNI KOREA. All rights reserved.</span><span>대한민국 · 한국어</span></div>
      </div>
    </footer>
  );
}
