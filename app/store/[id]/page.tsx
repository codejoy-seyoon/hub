import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProduct, productImages } from "@/lib/data/products";
import { categoryLabel, productCategory, storeHref } from "@/lib/storefront";
import { won } from "@/lib/format";
import { ProductGallery } from "@/components/store/ProductGallery";
import { StoreIcon } from "@/components/store/StoreIcon";
import { ProductBuy } from "./ProductBuy";

export default async function ProductDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ browse?: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const { browse } = await searchParams;
  const preserved = new URLSearchParams();
  const requested = new URLSearchParams(typeof browse === "string" ? browse : "");
  for (const key of ["category", "q", "price", "sort", "stock", "page"]) {
    const value = requested.get(key);
    if (value) preserved.set(key, value.slice(0, 100));
  }
  if (product.id !== id) {
    redirect(`/store/${product.id}${preserved.size ? `?browse=${encodeURIComponent(preserved.toString())}` : ""}`);
  }
  const backHref = `${storeHref()}${preserved.size ? `?${preserved}` : ""}`;
  const soldOut = product.stock <= 0;
  return (
    <main className="store-detail store-wrap" id="store-main">
      <nav className="pd-breadcrumb" aria-label="현재 위치">
        <Link href="/store">스토어</Link><StoreIcon name="chevron" size={12} />
        <Link href={storeHref(productCategory(product))}>{categoryLabel(product)}</Link><StoreIcon name="chevron" size={12} /><span>{product.name}</span>
      </nav>
      <div className="store-detail-grid">
        <ProductGallery key={product.id} images={productImages(product)} name={product.name} contain={product.fit === "contain"} />
        <div className="pd-info">
          <p className="product-cat">{categoryLabel(product)}</p>
          <h1 className="pd-name">{product.name}</h1>
          <p className="pd-price">{won(product.price)}</p>
          <p className={`pd-stock ${soldOut ? "pd-stock-out" : ""}`}>{soldOut ? "품절 · 다음 입고를 기다려 주세요" : `구매 가능 · 재고 ${product.stock}${product.stockUnit ?? "개"}`}</p>
          <hr className="pd-divider" />
          <dl className="pd-meta"><dt>배송비</dt><dd>3,000원<small>상품 합계 50,000원 이상 무료배송</small></dd><dt>브랜드</dt><dd>BNI KOREA 공식 굿즈</dd></dl>
          <ProductBuy productId={product.id} price={product.price} stock={product.stock} backHref={backHref} />
          {product.contents?.length ? <section className="pd-contents" aria-labelledby="product-contents-title">
            <h2 id="product-contents-title">세트 구성 · {product.contents.length}종 각 1개</h2>
            <ul>{product.contents.map((item) => <li key={item}>{item}</li>)}</ul>
            {product.contentsNote && <p>{product.contentsNote}</p>}
          </section> : null}
        </div>
      </div>
    </main>
  );
}
