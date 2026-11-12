import type { Product } from "./data/products";

export const STORE_CATEGORIES = [
  { id: "all", label: "전체 상품" },
  { id: "gift", label: "웰컴팩" },
  { id: "apparel", label: "의류" },
  { id: "living", label: "리빙" },
  { id: "stationery", label: "문구" },
  { id: "books", label: "도서" },
  { id: "badge", label: "뱃지" },
  { id: "ribbon", label: "리본" },
  { id: "sets", label: "세트 상품" },
  { id: "new", label: "신상품" },
] as const;
export type StoreCategory = (typeof STORE_CATEGORIES)[number]["id"];
// 신상품 목록은 홈의 '새로운 BNI 아이템'에서 열고, 메뉴에는 세트 상품을 표시한다.
export const STORE_NAV_CATEGORIES = STORE_CATEGORIES.filter((category) => category.id !== "new");

// 임시 상품명이 남아 있는 책·책자·인쇄물은 실제 사진을 확인해 분류한다.
const BOOK_PRODUCT_IDS = new Set([
  "renew-013", "renew-028", "renew-029", "renew-030", "renew-031", "renew-032", "renew-033", "renew-034",
  "renew-041", "renew-042", "renew-043", "renew-044", "renew-045", "renew-046", "renew-047", "renew-050", "renew-051",
  "renew-083", "renew-084", "renew-085", "renew-086", "renew-087",
  "renew-089", "renew-090", "renew-091", "renew-092", "renew-093", "renew-094", "renew-095", "renew-096", "renew-097", "renew-098",
]);
const STATIONERY_PRODUCT_IDS = new Set(["renew-088"]);
const SET_PRODUCT_IDS = new Set(["renew-021"]);

// 리본 기본 진열: 세트 → 의장·부의장·ST → 기타 직책·수료 → 연차 순.
const RIBBON_PRODUCT_ORDER = [
  "ribbon-role-set", "renew-058", "renew-010", "renew-011", "renew-075", "renew-072", "renew-077",
  "renew-025", "renew-074", "renew-073", "renew-009", "renew-078", "renew-007",
  "renew-071", "ribbon-member-trainer", "renew-069", "renew-008",
  "renew-066", "renew-068", "renew-026", "renew-076", "renew-082", "renew-064",
  "renew-081", "renew-070", "renew-079", "renew-059",
];

export function defaultProductOrder(product: Product, category: StoreCategory) {
  if (category === "ribbon") {
    const rank = RIBBON_PRODUCT_ORDER.indexOf(product.id);
    return rank < 0 ? RIBBON_PRODUCT_ORDER.length : rank;
  }
  return Number(product.name.includes("(리뉴얼)"));
}

// 판매 가격·재고는 유지하고 화면에서 찾기 쉬운 분류를 붙인다.
export function productCategory(product: Product): StoreCategory {
  if (BOOK_PRODUCT_IDS.has(product.id) || /도서|브로슈어|책자/.test(product.name)) return "books";
  if (STATIONERY_PRODUCT_IDS.has(product.id)) return "stationery";
  if (product.category === "세트" || SET_PRODUCT_IDS.has(product.id)) return "sets";
  if (/폰링|기프트백/.test(product.name)) return "living";
  if (product.category === "의류" || product.category === "액세서리") return "apparel";
  if (product.category === "리본" || /리본/.test(product.name)) return "ribbon";
  if (product.category === "뱃지" || /뱃지|명찰|로고 카드/.test(product.name)) return "badge";
  if (/기프트|웰컴|파우치/.test(product.name)) return "gift";
  if (product.category === "리빙" || /머그|텀블러|서비스 벨/.test(product.name)) return "living";
  if (/다이어리|노트|만년필|펜|타공기/.test(product.name)) return "stationery";
  return "new";
}
export function categoryLabel(product: Product) {
  return STORE_CATEGORIES.find((category) => category.id === productCategory(product))!.label;
}
export function matchesCategory(product: Product, category: StoreCategory) {
  if (category === "all") return true;
  if (category === "new") return product.category === "신상품";
  if (category === "ribbon" && product.id === "ribbon-role-set") return true;
  if (category === "gift" && productCategory(product) === "sets") return product.id !== "renew-021" && /웰컴/.test(product.name);
  return productCategory(product) === category;
}
export function storeHref(category: StoreCategory = "all") {
  return category === "all" ? "/store/products" : `/store/products?category=${category}`;
}
