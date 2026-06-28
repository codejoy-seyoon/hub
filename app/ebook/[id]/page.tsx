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
  const stars = "★".repeat(Math.round(book.rating)) + "☆".repeat(5 - Math.round(book.rating));

  return (
    <>
      {/* breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="pg-container">
          <Link href="/ebook">eBook</Link>
          <span className="sep">/</span>
          <span className="cur">{book.category}</span>
          <span className="sep">/</span>
          <span className="cur">{book.title}</span>
        </div>
      </div>

      <div className="pg-container" style={{ padding: "40px 16px" }}>
        <div className="grid gap-10 md:grid-cols-[300px_1fr]">
          {/* 표지 + 구매 */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bookCover(book.cover)} alt={book.title} className="detail-cover" />
            <div className="mt-4 grid gap-2">
              <Link href={`/ebook/checkout?bookId=${book.id}`} className="btn-buy">
                구매하기 · {won(book.price)}
              </Link>
              <button className="btn-cart-lg" type="button">장바구니 담기</button>
            </div>
          </div>

          {/* 정보 */}
          <div>
            <span className="genre-tag">{book.category}</span>
            <h1 className="detail-title">{book.title}</h1>
            <p className="detail-author">{book.author} · {book.publisher}</p>
            <div className="detail-stars">
              {stars}
              <span className="review-count">{book.rating} ({book.reviewCount}개 리뷰)</span>
            </div>

            <div className="info-row">
              <div className="info-item"><div className="info-label">출판사</div><div className="info-val">{book.publisher}</div></div>
              <div className="info-item"><div className="info-label">출간일</div><div className="info-val">{book.pubDate}</div></div>
              <div className="info-item"><div className="info-label">분량</div><div className="info-val">{book.pages}</div></div>
              <div className="info-item"><div className="info-label">포맷</div><div className="info-val">{book.format}</div></div>
            </div>

            <div className="detail-price">
              {discount > 0 && <span style={{ color: "var(--cta)", marginRight: 10 }}>{discount}%</span>}
              {won(book.price)}
              {book.originalPrice > book.price && (
                <span className="price-sub" style={{ textDecoration: "line-through" }}>{won(book.originalPrice)}</span>
              )}
            </div>

            <div className="detail-section" style={{ marginTop: 24, paddingTop: 24 }}>
              <h3 className="detail-section-title">책 소개</h3>
              <p className="detail-desc" dangerouslySetInnerHTML={{ __html: book.desc }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
