"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { won } from "@/lib/format";

export function ProductBuy({
  productId,
  price,
  stock,
}: {
  productId: string;
  price: number;
  stock: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const soldOut = stock <= 0;
  const max = Math.max(1, Math.min(stock, 99));

  return (
    <div>
      {!soldOut && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--bni-body)]">
            수량
          </span>
          <div className="flex items-center rounded-lg border border-[var(--bni-line)]">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 text-lg"
            >
              −
            </button>
            <span className="w-12 text-center font-semibold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="h-10 w-10 text-lg"
            >
              +
            </button>
          </div>
          <span className="ml-auto text-lg font-extrabold text-[var(--bni-red)]">
            {won(price * qty)}
          </span>
        </div>
      )}

      <div className="pd-actions">
        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            router.push(`/store/checkout?productId=${productId}&qty=${qty}`)
          }
          className="btn lv-btn-dark pd-buy"
        >
          {soldOut ? "품절" : "구매하기"}
        </button>
        <Link href="/store" className="btn lv-btn-light pd-back" style={{ border: "1px solid var(--bni-ink)", color: "var(--bni-ink)" }}>
          목록으로
        </Link>
      </div>
    </div>
  );
}
