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
 * 상품 이미지 키를 사진 주소로 변환.
 * 키는 ASCII 안전 경로 (예: "renewal-1/332A9392.jpg", "goods/welcome.png").
 *
 * 2026-11-12: 사진을 올려 둔 Supabase 프로젝트(tewnbrlwveyottrrwqoc) 주소가 사라져
 * 사진이 전부 빈칸이 됐다. 그래서 사이트가 직접 사진을 갖도록 바꿨다.
 * - 기본: public/store-web/<키>  (scripts/build-local-images.mjs 로 원본에서 생성)
 * - 외부 저장소를 다시 쓰려면 NEXT_PUBLIC_STORE_IMG_BASE 에 그 주소를 넣는다
 *   (예: https://<프로젝트>.supabase.co/storage/v1/object/public/store-img).
 */
const STORAGE_BASE = (
  process.env.NEXT_PUBLIC_STORE_IMG_BASE || "/store-web"
).replace(/\/+$/, "");

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
