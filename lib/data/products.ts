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

/** 이미지 파일명을 public 경로로 변환 (기존 store/img 규칙 계승) */
export function productImg(file: string): string {
  if (!file) return "";
  // 하위 폴더(/ 포함)면 store-img 루트, 아니면 bni_korea_goods_img 폴더
  const path = file.includes("/")
    ? `/store-img/${file}`
    : `/store-img/bni_korea_goods_img/${file}`;
  return encodeURI(path);
}

export function productImages(p: Product): string[] {
  const list = p.images && p.images.length ? p.images : [p.img];
  return list.map(productImg);
}
