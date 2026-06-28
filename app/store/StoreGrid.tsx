"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data/products";
import { productImg } from "@/lib/data/products";
import { won } from "@/lib/format";

export function StoreGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    products.forEach((p) => {
      if (!seen.includes(p.category)) seen.push(p.category);
    });
    return ["전체", ...seen];
  }, [products]);

  const [cat, setCat] = useState("전체");
  const shown = products.filter((p) => cat === "전체" || p.category === cat);

  return (
    <>
      {/* 카테고리 필터 칩 */}
      <div className="cat-filter mb-5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`cat-chip ${cat === c ? "active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div
        id="productGrid"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {shown.map((p) => {
          const soldOut = p.stock <= 0;
          return (
            <Link
              key={p.id}
              href={`/store/${p.id}`}
              className={`product-card ${soldOut ? "is-soldout" : ""}`}
            >
              <div
                className={`product-thumb ${
                  p.fit === "contain" ? "is-fit-contain" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pthumb-img"
                  src={productImg(p.img)}
                  alt={p.name}
                />
                {soldOut && <span className="soldout-badge">SOLD OUT</span>}
                {!soldOut && p.stock <= 5 && (
                  <span className="stock-badge">품절임박 {p.stock}개</span>
                )}
              </div>
              <p className="product-cat">{p.category}</p>
              <h3 className="product-name">{p.name}</h3>
              <p className="product-price">{won(p.price)}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
