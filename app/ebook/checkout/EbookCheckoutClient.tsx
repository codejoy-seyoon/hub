"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBook, bookCover } from "@/lib/data/books";
import { won } from "@/lib/format";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import type { Customer, OrderRequest } from "@/lib/catalog";

export function EbookCheckoutClient() {
  const sp = useSearchParams();
  const bookId = sp.get("bookId") ?? "";
  const book = getBook(bookId);

  if (!book) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">도서를 찾을 수 없습니다</h1>
        <Link href="/ebook" className="font-semibold text-bni-red">이북으로 돌아가기</Link>
      </main>
    );
  }

  const makeRequest = (customer: Customer): OrderRequest => ({
    domain: "ebook",
    customer,
    items: [{ bookId: book.id }],
  });

  const summary = (
    <section className="rounded-2xl border border-bni-line p-5">
      <h2 className="mb-4 text-lg font-bold">구매 도서</h2>
      <div className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bookCover(book.cover)}
          alt={book.title}
          className="h-24 w-18 flex-none rounded-md border border-bni-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-bni-body">{book.category}</p>
          <h3 className="font-semibold">{book.title}</h3>
          <p className="text-sm text-bni-body">{book.author}</p>
          <p className="mt-1 text-xs text-bni-body">{book.format} · 구매 후 바로 열람</p>
        </div>
        <div className="font-bold">{won(book.price)}</div>
      </div>
      <dl className="mt-4 flex justify-between border-t border-bni-line pt-4 text-base font-extrabold">
        <dt>총 결제금액</dt>
        <dd className="text-bni-red">{won(book.price)}</dd>
      </dl>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-2xl font-extrabold">구매 / 결제</h1>
      <CheckoutPanel makeRequest={makeRequest} amount={book.price} summary={summary} />
    </main>
  );
}
