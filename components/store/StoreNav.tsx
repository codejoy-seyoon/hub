import Link from "next/link";
import { storeHref } from "@/lib/storefront";
import { StoreIcon } from "./StoreIcon";
import { StoreCategoryLinks } from "./StoreCategoryLinks";
import { StoreHeaderSearch } from "./StoreHeaderSearch";

export function StoreNav() {
  return (
    <header className="store-header">
      <div className="store-header-main">
        <Link href="/store" className="store-brand" aria-label="BNI STORE 홈">
          <img className="store-brand-logo" src="/brand/bni-logo-red-pms.png" alt="BNI" width={1165} height={447} />
          <span className="store-brand-store">STORE</span>
        </Link>
        <nav className="store-primary-nav" aria-label="주 메뉴">
          <Link href={storeHref()}>전체 상품</Link>
          <Link href="/store#store-guide">이용 안내</Link>
        </nav>
        <div className="store-header-actions">
          <StoreHeaderSearch />
          <Link href="/orders" className="store-order-link" aria-label="주문 조회"><StoreIcon name="bag" /><span>주문 조회</span></Link>
        </div>
      </div>
      <nav className="store-navigation" aria-label="스토어 카테고리">
        <div className="store-wrap store-navigation-inner">
          <StoreCategoryLinks />
        </div>
      </nav>
    </header>
  );
}
