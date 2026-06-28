"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/data/books";
import { bookCover } from "@/lib/data/books";
import { won } from "@/lib/format";

type Tab = "recommended" | "bestseller" | "newest";
const TABS: [Tab, string][] = [
  ["recommended", "추천순"],
  ["bestseller", "판매순"],
  ["newest", "최신순"],
];

function BookCard({ b, badge }: { b: Book; badge?: "new" | "best" }) {
  return (
    <div className="book-card">
      <Link href={`/ebook/${b.id}`}>
        <div className="book-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookCover(b.cover)} alt={b.title} />
          {badge && (
            <span className={`book-badge ${badge}`}>{badge === "new" ? "NEW" : "베스트"}</span>
          )}
        </div>
      </Link>
      <p className="book-brand">PAGELY</p>
      <h6 className="book-title">{b.title}</h6>
      <span className="book-category">{b.category}</span>
      <p className="book-author">{b.author}</p>
      <p className="book-price">{won(b.price)}</p>
      <Link href={`/ebook/${b.id}`} className="btn-outline-primary-custom" style={{ width: "100%", borderRadius: 0 }}>
        담기
      </Link>
    </div>
  );
}

export function BookGrid({ books }: { books: Book[] }) {
  const [tab, setTab] = useState<Tab>("recommended");

  const shown = useMemo(() => {
    const arr = [...books];
    if (tab === "bestseller") arr.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (tab === "newest") arr.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));
    return arr;
  }, [books, tab]);

  return (
    <>
      <ul className="book-tabs">
        {TABS.map(([k, l]) => (
          <li key={k}>
            <button className={`book-tab-btn ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
              {l}
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((b, i) => (
          <BookCard
            key={b.id}
            b={b}
            badge={tab === "newest" ? "new" : i < 2 ? "best" : undefined}
          />
        ))}
      </div>
    </>
  );
}
