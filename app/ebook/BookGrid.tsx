"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/data/books";
import { bookCover } from "@/lib/data/books";
import { won } from "@/lib/format";

export function BookGrid({ books }: { books: Book[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    books.forEach((b) => {
      if (!seen.includes(b.category)) seen.push(b.category);
    });
    return ["전체", ...seen];
  }, [books]);

  const [cat, setCat] = useState("전체");
  const shown = books.filter((b) => cat === "전체" || b.category === cat);

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

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((b) => (
          <Link key={b.id} href={`/ebook/${b.id}`} className="group">
            <div className="aspect-3/4 overflow-hidden rounded-xl border border-bni-line bg-bni-soft shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bookCover(b.cover)}
                alt={b.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold group-hover:text-bni-red">{b.title}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-bni-body">{b.author}</p>
            <p className="mt-1 text-sm font-bold text-bni-red">{won(b.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
