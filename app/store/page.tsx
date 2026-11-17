import Link from "next/link";
import { redirect } from "next/navigation";
import { getProduct, productImg } from "@/lib/data/products";
import { categoryLabel, hasNewBadge, storeHref, storePath } from "@/lib/storefront";
import { won } from "@/lib/format";
import { StoreIcon } from "@/components/store/StoreIcon";
import { StoreVideoHero } from "@/components/store/StoreVideoHero";

export const metadata = { title: "BNI STORE | 멤버와 챕터를 위한 공식 스토어" };

// 홈 진열 상품은 수동으로 선정한다. 상품 정보는 기존 데이터에서 가져온다.
const FREQUENT_PRODUCTS = [
  { id: "renew-006", placement: "small-top" },
  { id: "welcome-pouch", placement: "feature" },
  { id: "renew-010", placement: "small-bottom" },
  { id: "mug", placement: "bottom" },
  { id: "renew-023", placement: "bottom", image: "renewal-1/332A9476.jpg" },
  { id: "renew-003", placement: "bottom" },
];
const NEW_PRODUCTS = ["renew-002", "renew-003", "renew-004"];

export default async function StorePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 이전 목록 주소로 들어와도 새 상품 목록 페이지로 이어 준다.
  const requested = await searchParams;
  const browse = new URLSearchParams();
  for (const key of ["category", "q", "price", "sort", "stock", "page"]) {
    const value = requested[key];
    if (typeof value === "string" && value) browse.set(key, value.slice(0, 100));
  }
  if (browse.size) redirect(`${storeHref()}?${browse}`);
  return (
    <main id="store-main">
      <StoreVideoHero
        src="/store-web/video/business-day-v7-20261117.mp4"
        poster="/store-web/video/business-day-v7-20261117-poster.jpg"
      />

      <div className="store-benefit-bar" aria-label="쇼핑 안내">
        <span><StoreIcon name="truck" size={22} />5만 원 이상 무료배송</span>
        <span><StoreIcon name="check" size={21} />BNI KOREA 공식 굿즈</span>
      </div>

      <section className="store-editorial store-wrap" id="frequent-products" aria-labelledby="frequent-products-title">
        <div className="store-editorial-heading">
          <div><p className="store-eyebrow">일상에서 함께하는 BNI</p><h2 id="frequent-products-title">자주 찾는 제품</h2></div>
          <Link href={storeHref()} className="store-text-link store-editorial-more">전체 상품 보기 <StoreIcon name="arrow" size={18} /></Link>
        </div>
        <div className="store-mosaic">
          {FREQUENT_PRODUCTS.map(({ id, placement, image }) => {
            const product = getProduct(id);
            if (!product) return null;
            return <Link href={storePath(`/${id}`)} key={id} className={`store-mosaic-tile store-mosaic-${placement}${product.fit === "contain" ? " is-contain" : ""}`} aria-label={`${product.name}, ${won(product.price)}, 자세히 보기`}>
              <img src={productImg(image ?? product.img)} alt={product.name} loading="lazy" />
              <div className="store-mosaic-caption"><span><strong>{product.name}</strong><small>{won(product.price)}</small></span><StoreIcon name="arrow" size={22} /></div>
              <span className="store-mosaic-open" aria-hidden="true"><StoreIcon name="arrow" size={20} /></span>
            </Link>;
          })}
        </div>
      </section>

      <section className="store-collections store-wrap" id="new-arrivals" aria-labelledby="new-items-title">
        <div className="store-editorial-heading is-centered"><p className="store-eyebrow">일상에 더하는 새로운 발견</p><h2 id="new-items-title"><Link href={storeHref("new")}>새로운 BNI 아이템 <StoreIcon name="arrow" size={38} /></Link></h2></div>
        <div className="store-collection-grid">
          {NEW_PRODUCTS.map((id) => {
            const product = getProduct(id);
            if (!product || product.category !== "신상품") return null;
            return <Link href={storePath(`/${id}`)} key={id} className="store-collection-card">
              <div className="store-collection-image"><img src={productImg(product.img)} alt={product.name} loading="lazy" />{hasNewBadge(product) ? <span className="store-product-tag">NEW</span> : null}</div>
              <p>{categoryLabel(product)}</p><h3>{product.name}<StoreIcon name="arrow" size={22} /></h3><span className="store-collection-price">{won(product.price)}</span>
            </Link>;
          })}
        </div>
      </section>

      <section className="store-service-strip store-wrap" id="store-guide" aria-label="주문과 배송 안내">
        <div><StoreIcon name="check" size={26} /><span><strong>BNI KOREA 공식 굿즈</strong><small>멤버의 일상과 비즈니스를 함께합니다.</small></span></div>
        <div><StoreIcon name="truck" size={26} /><span><strong>5만 원 이상 무료배송</strong><small>5만 원 미만 주문 시 배송비 3,000원</small></span></div>
        <Link href="/orders"><StoreIcon name="bag" size={26} /><span><strong>내 주문을 한눈에</strong><small>주문 내역과 결제 상태 확인하기</small></span><StoreIcon name="arrow" /></Link>
      </section>
    </main>
  );
}
