import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, productImages } from "@/lib/data/products";
import { won } from "@/lib/format";
import { ProductBuy } from "./ProductBuy";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const images = productImages(product);
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 5;

  return (
    <section className="lv-section">
      <div className="lv-container">
        {/* breadcrumb */}
        <nav className="pd-breadcrumb mb-4">
          <Link href="/store">스토어</Link>
          <i className="bi bi-chevron-right" />
          <span>{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* 이미지 */}
          <div>
            <div
              className={`product-thumb pd-image ${
                product.fit === "contain" ? "is-fit-contain" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pthumb-img" src={images[0]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.slice(0, 8).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    className="h-16 w-16 flex-none rounded-lg border border-[var(--bni-line)] object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="pd-info">
            <p className="product-cat">{product.category}</p>
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">{won(product.price)}</p>
            <p
              className={`pd-stock ${
                soldOut ? "pd-stock-out" : low ? "pd-stock-low" : "pd-stock-ok"
              }`}
            >
              {soldOut
                ? "품절"
                : low
                  ? `품절임박 · 잔여 ${product.stock}개`
                  : `재고 있음 · ${product.stock}개`}
            </p>

            <hr className="pd-divider" />
            <ul className="pd-meta">
              <li>
                <i className="bi bi-truck" /> 5만원 이상 무료배송
              </li>
              <li>
                <i className="bi bi-arrow-repeat" /> 7일 이내 교환·반품
              </li>
              <li>
                <i className="bi bi-shield-check" /> BNI KOREA 공식 굿즈
              </li>
            </ul>

            <ProductBuy
              productId={product.id}
              price={product.price}
              stock={product.stock}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
