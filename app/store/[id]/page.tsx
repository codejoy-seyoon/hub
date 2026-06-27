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

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm text-bni-body">
        <Link href="/store" className="hover:text-bni-red">스토어</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-bni-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-bni-line bg-bni-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt={product.name}
              className={`h-full w-full ${product.fit === "contain" ? "object-contain p-6" : "object-cover"}`}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.slice(0, 8).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className="h-16 w-16 flex-none rounded-lg border border-bni-line object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-bni-body">{product.category}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-snug">{product.name}</h1>
          <p className="mt-3 text-2xl font-extrabold text-bni-red">{won(product.price)}</p>
          <p className={`mt-1 text-sm font-semibold ${soldOut ? "text-bni-body" : product.stock <= 5 ? "text-bni-red" : "text-emerald-600"}`}>
            {soldOut ? "품절" : product.stock <= 5 ? `품절임박 · 잔여 ${product.stock}개` : `재고 있음 · ${product.stock}개`}
          </p>

          <ul className="mt-6 space-y-2 border-t border-bni-line pt-5 text-sm">
            <li>🚚 5만원 이상 무료배송</li>
            <li>🔁 7일 이내 교환·반품</li>
            <li>🛡️ BNI KOREA 공식 굿즈</li>
          </ul>

          <ProductBuy productId={product.id} price={product.price} stock={product.stock} />
        </div>
      </div>
    </main>
  );
}
