"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { won } from "@/lib/format";
import { StoreIcon } from "@/components/store/StoreIcon";

export function ProductBuy({ productId, price, stock, backHref }: { productId: string; price: number; stock: number; backHref: string }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const soldOut = stock <= 0;
  const max = Math.max(1, Math.min(stock, 99));
  const subtotal = price * qty;
  return (
    <div>
      {!soldOut && <>
        <div className="store-quantity"><span>구매 수량</span><div className="store-quantity-controls">
          <button type="button" aria-label="수량 줄이기" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <output aria-label="구매 수량" aria-live="polite">{qty}</output>
          <button type="button" aria-label="수량 늘리기" disabled={qty >= max} onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
        </div></div>
        <div className="store-purchase-total"><span>상품 합계</span><strong aria-live="polite">{won(subtotal)}</strong></div>
      </>}
      <div className="pd-actions">
        <Link href={backHref} className="store-button">목록으로</Link>
        <button type="button" disabled={soldOut} onClick={() => router.push(`/store/checkout?productId=${productId}&qty=${qty}`)} className="store-button store-button-primary">{soldOut ? "품절" : "구매하기"}<StoreIcon name="arrow" size={18} /></button>
      </div>
      {!soldOut && <p className="store-purchase-shipping">{subtotal >= 50000 ? "무료배송 대상 상품입니다." : `${won(50000 - subtotal)} 더 담으면 무료배송`}</p>}
    </div>
  );
}
