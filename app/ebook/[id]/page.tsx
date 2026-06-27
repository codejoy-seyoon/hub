import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, bookCover } from "@/lib/data/books";
import { won } from "@/lib/format";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm text-bni-body">
        <Link href="/ebook" className="hover:text-bni-red">이북</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-bni-ink">{book.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-[260px_1fr]">
        <div className="aspect-3/4 overflow-hidden rounded-xl border border-bni-line bg-bni-soft shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookCover(book.cover)} alt={book.title} className="h-full w-full object-cover" />
        </div>

        <div>
          <p className="text-sm text-bni-body">{book.category}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-snug">{book.title}</h1>
          <p className="mt-1 text-bni-body">{book.author}</p>

          <div className="mt-4 flex items-end gap-3">
            {discount > 0 && <span className="text-lg font-bold text-bni-red">{discount}%</span>}
            <span className="text-2xl font-extrabold">{won(book.price)}</span>
            {book.originalPrice > book.price && (
              <span className="text-sm text-bni-body line-through">{won(book.originalPrice)}</span>
            )}
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-y-1.5 border-t border-bni-line pt-5 text-sm text-bni-body">
            <li>출판사 · {book.publisher}</li>
            <li>출간 · {book.pubDate}</li>
            <li>분량 · {book.pages}</li>
            <li>포맷 · {book.format}</li>
            <li>평점 · ★ {book.rating} ({book.reviewCount})</li>
          </ul>

          <p
            className="mt-5 text-sm leading-relaxed text-bni-body"
            dangerouslySetInnerHTML={{ __html: book.desc }}
          />

          <Link
            href={`/ebook/checkout?bookId=${book.id}`}
            className="mt-7 inline-flex h-13 w-full items-center justify-center rounded-xl bg-bni-ink py-3.5 font-bold text-white transition hover:opacity-90"
          >
            구매하기
          </Link>
        </div>
      </div>
    </main>
  );
}
