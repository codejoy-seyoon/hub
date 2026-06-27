import raw from "./_books.json";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  pubDate: string;
  pages: string;
  format: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  cover: string;
  desc: string;
};

export const BOOKS: Book[] = raw as Book[];

const BY_ID = new Map(BOOKS.map((b) => [b.id, b]));

export function getBook(id: string): Book | undefined {
  return BY_ID.get(id);
}

/** 표지 경로 (기존 ebook/images → public/ebook-img) */
export function bookCover(cover: string): string {
  if (!cover) return "";
  // "images/xxx.png" → "/ebook-img/xxx.png"
  const file = cover.replace(/^images\//, "");
  return encodeURI(`/ebook-img/${file}`);
}
