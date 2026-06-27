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
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              cat === c
                ? "border-bni-red bg-bni-red text-white"
                : "border-bni-line bg-white text-bni-ink hover:border-bni-red hover:text-bni-red"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => {
          const soldOut = p.stock <= 0;
          return (
            <Link
              key={p.id}
              href={`/store/${p.id}`}
              className="group overflow-hidden rounded-2xl border border-bni-line transition hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-bni-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImg(p.img)}
                  alt={p.name}
                  className={`h-full w-full transition group-hover:scale-105 ${
                    p.fit === "contain" ? "object-contain p-4" : "object-cover"
                  }`}
                />
                {soldOut && (
                  <span className="absolute left-3 top-3 rounded bg-bni-ink/80 px-2 py-1 text-xs font-bold text-white">
                    SOLD OUT
                  </span>
                )}
                {!soldOut && p.stock <= 5 && (
                  <span className="absolute left-3 top-3 rounded bg-bni-red px-2 py-1 text-xs font-bold text-white">
                    품절임박 {p.stock}개
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-bni-body">{p.category}</p>
                <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold">{p.name}</h3>
                <p className="mt-1.5 font-bold text-bni-red">{won(p.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
