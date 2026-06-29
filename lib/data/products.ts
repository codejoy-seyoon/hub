import raw from "./_products.json";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  img: string;
  images?: string[];
  stock: number;
  fit?: "contain" | "cover";
};

export const PRODUCTS: Product[] = raw as Product[];

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return BY_ID.get(id);
}

/**
 * 상품 이미지 키를 Supabase Storage 공개 URL로 변환.
 * 이미지는 store-img 버킷에 호스팅됨 (scripts/migrate-images.mjs 로 업로드).
 * 키는 ASCII 안전 경로 (예: "renewal-1/332A9392.jpg", "goods/welcome.png").
 */
// Supabase 프로젝트 URL은 공개 정보(공개 버킷 주소)이므로, Vercel 환경변수가
// 비어 있어도 이미지가 깨지지 않도록 하드코딩 폴백을 둔다.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tewnbrlwveyottrrwqoc.supabase.co";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/store-img`;

export function productImg(file: string): string {
  if (!file) return "";
  // 과거 데이터(폴더 없는 파일명) 호환: goods 폴더로 간주
  const key = file.includes("/") ? file : `goods/${file}`;
  return `${STORAGE_BASE}/${encodeURI(key)}`;
}

export function productImages(p: Product): string[] {
  const list = p.images && p.images.length ? p.images : [p.img];
  return list.map(productImg);
}
