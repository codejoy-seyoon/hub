import Link from "next/link";
import { storePath } from "@/lib/storefront";
import { StoreIcon } from "./StoreIcon";
import { StoreCategoryLinks } from "./StoreCategoryLinks";
import { StoreHeaderSearch } from "./StoreHeaderSearch";

export function StoreNav() {
  return (
    <header className="store-header">
      <div className="store-header-main">
        <Link href={storePath()} className="store-brand" aria-label="BNI Store 홈">
          <img className="store-brand-logo" src="/brand/bni-store-logo.png" alt="BNI Store" width={600} height={451} />
        </Link>
        {/* 넓은 화면: 카테고리 메뉴를 로고와 같은 줄에 둔다 */}
        <nav className="store-header-nav" aria-label="스토어 카테고리">
          <StoreCategoryLinks />
        </nav>
        <div className="store-header-actions">
          <StoreHeaderSearch />
          <Link href="/orders" className="store-order-link" aria-label="주문 조회"><StoreIcon name="bag" /><span>주문 조회</span></Link>
        </div>
      </div>
      {/* 좁은 화면: 한 줄에 다 안 들어가므로 로고 아래 줄에서 옆으로 넘겨 본다 */}
      <nav className="store-navigation" aria-label="스토어 카테고리">
        <div className="store-wrap store-navigation-inner">
          <StoreCategoryLinks />
        </div>
      </nav>
    </header>
  );
}
