"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProduct, productImg } from "@/lib/data/products";
import { won } from "@/lib/format";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import type { Customer, OrderRequest } from "@/lib/catalog";

export function StoreCheckoutClient() {
  const sp = useSearchParams();
  const productId = sp.get("productId") ?? "";
  const qty = Math.max(1, Math.min(99, Number(sp.get("qty")) || 1));
  const product = getProduct(productId);

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">상품을 찾을 수 없습니다</h1>
        <Link href="/store" className="font-semibold text-bni-red">스토어로 돌아가기</Link>
      </main>
    );
  }

  const subtotal = product.price * qty;
  const shipping = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  const makeRequest = (customer: Customer): OrderRequest => ({
    domain: "store",
    customer,
    items: [{ productId: product.id, quantity: qty }],
  });

  const summary = (
    <section className="rounded-2xl border border-bni-line p-5">
      <h2 className="mb-4 text-lg font-bold">주문 상품</h2>
      <div className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImg(product.img)}
          alt={product.name}
          className="h-20 w-20 flex-none rounded-lg border border-bni-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-bni-body">{product.category}</p>
          <h3 className="truncate font-semibold">{product.name}</h3>
          <p className="text-sm text-bni-body">
            {qty}개 × {won(product.price)}
          </p>
        </div>
        <div className="font-bold">{won(subtotal)}</div>
      </div>
      <dl className="mt-4 grid gap-1.5 border-t border-bni-line pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-bni-body">상품 합계</dt><dd>{won(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-bni-body">배송비</dt><dd>{won(shipping)}</dd></div>
        <div className="flex justify-between text-base font-extrabold"><dt>총 결제금액</dt><dd className="text-bni-red">{won(total)}</dd></div>
      </dl>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-2xl font-extrabold">주문 / 결제</h1>
      <CheckoutPanel makeRequest={makeRequest} amount={total} summary={summary} />
    </main>
  );
}
