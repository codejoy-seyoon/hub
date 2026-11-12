import raw from "./_products.json";
import studioImages from "./_studio-products.json";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  img: string;
  images?: string[];
  stock: number;
  fit?: "contain" | "cover";
  contents?: string[];
  contentsNote?: string;
  stockUnit?: "개" | "세트";
};

// 승인한 스튜디오 사진만 덮어 쓰고 원본 상품 정보·사진 경로는 남겨 둔다.
const STUDIO_IMAGES: Record<string, string[]> = studioImages;
// 동일 제품의 다른 촬영 컷이 별도 등록된 경우 대표 상품으로 연결한다.
// 원본 기록은 남기고, 목록에는 대표 상품만 표시한다.
const PRODUCT_ALIASES: Record<string, string> = {
  "renew-002": "renew-021",
  "renew-020": "renew-052",
  "renew-024": "renew-018",
  "renew-040": "renew-003",
  "renew-060": "renew-059",
  "renew-061": "renew-059",
  "renew-062": "renew-059",
  "renew-063": "renew-059",
  "renew-065": "renew-064",
  "renew-067": "renew-066",
  "renew-080": "renew-009",
};
// 판매에서 삭제한 게시물은 원본 사진·기록만 보관한다.
const REMOVED_PRODUCT_IDS = new Set(["renew-017", "renew-033", "renew-034", "renew-041", "renew-042"]);
export const PRODUCTS: Product[] = (raw as Product[]).filter((product) => !PRODUCT_ALIASES[product.id] && !REMOVED_PRODUCT_IDS.has(product.id)).map((product) => {
  const images = STUDIO_IMAGES[product.id];
  return images?.length ? { ...product, img: images[0], images, fit: "cover" } : product;
});

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return BY_ID.get(PRODUCT_ALIASES[id] ?? id);
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
  // 새 승인본은 저장소에 함께 보관하므로 외부 이미지 설정에도 빠지지 않는다.
  const base = key.startsWith("studio/") ? "/store-web" : STORAGE_BASE;
  return `${base}/${encodeURI(key)}`;
}

export function productImages(p: Product): string[] {
  const list = p.images && p.images.length ? p.images : [p.img];
  return list.map(productImg);
}
