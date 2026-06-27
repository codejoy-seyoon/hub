import { BOOKS } from "@/lib/data/books";
import { BookGrid } from "./BookGrid";

export const metadata = { title: "이북 | BNI KOREA HUB" };

export default function EbookPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">이북 스토어</h1>
        <p className="mt-2 text-bni-body">전자책을 구매하고 바로 열람하세요.</p>
      </header>
      <BookGrid books={BOOKS} />
    </main>
  );
}
