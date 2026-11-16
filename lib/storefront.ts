import type { Product } from "./data/products";

export const STORE_CATEGORIES = [
  { id: "all", label: "전체 상품", en: "All Products" },
  { id: "gift", label: "웰컴팩", en: "Welcome Pack" },
  { id: "apparel", label: "의류", en: "Apparel" },
  { id: "living", label: "리빙", en: "Living" },
  { id: "stationery", label: "문구", en: "Stationery" },
  { id: "books", label: "도서", en: "Books" },
  { id: "badge", label: "뱃지", en: "Badges" },
  { id: "ribbon", label: "리본", en: "Ribbons" },
  { id: "sets", label: "세트 상품", en: "Sets" },
  { id: "new", label: "신상품", en: "New" },
] as const;
export type StoreCategory = (typeof STORE_CATEGORIES)[number]["id"];
// 신상품 목록은 홈의 '새로운 BNI 아이템'에서 열고, 메뉴에는 세트 상품을 표시한다.
// 메뉴 순서(2026-11-16 지정): 웰컴팩 → 뱃지 → 리본 → 의류 → 도서 → 문구 → 리빙 → 세트 상품 → 전체 상품.
const STORE_NAV_ORDER: StoreCategory[] = ["gift", "badge", "ribbon", "apparel", "books", "stationery", "living", "sets", "all"];
export const STORE_NAV_CATEGORIES = STORE_NAV_ORDER.map((id) => STORE_CATEGORIES.find((category) => category.id === id)!);

// 임시 상품명이 남아 있는 책·책자·인쇄물은 실제 사진을 확인해 분류한다.
const BOOK_PRODUCT_IDS = new Set([
  "renew-012", // 리퍼럴 마케팅: 상품명에서 '도서'를 뺀 뒤에도 도서로 분류되도록 명시
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

// 의류 기본 진열(2026-11-16 지정): 첫 줄 카라 티 화이트 → 블랙 → 집업 → 볼캡,
// 둘째 줄 실크 스카프(레드) → 클래식 타이 → 자동 타이 → 실크 100% 스카프(화이트).
const APPAREL_PRODUCT_ORDER = [
  "polo-white", "polo-black", "hoodie", "cap",
  "scarf-red", "tie-classic", "tie-auto", "scarf-white",
];

// 문구 기본 진열(2026-11-16 지정): 화이트 펜 → 만년필 → 레드 다이어리 → 상장 케이스(Navy) → 타공기.
const STATIONERY_PRODUCT_ORDER = ["renew-018", "renew-023", "renew-003", "renew-088", "renew-016"];

// 도서 기본 진열(2026-11-16 지정): 리퍼럴 마케팅 → 오지랖 → 마스터 커넥터 → 연결하라 → 코어 트랜스포메이션 → 장인의 장사 → 워크북 2종 → 멤버 가이드.
// 목록에 없는 도서는 그 뒤에, 이름이 정해진 것 먼저·임시 이름(리뉴얼) 나중 순으로 둔다.
const BOOK_PRODUCT_ORDER = [
  // 1줄: 리퍼럴 마케팅 → 오지랖 → 마스터 커넥터 → 연결하라
  "renew-012", "renew-084", "renew-085", "renew-083",
  // 2줄: 코어 트랜스포메이션 → 장인의 장사 → 멤버 석세스 워크북 → 멤버 성공 워크북
  "renew-086", "renew-087", "renew-096", "renew-013",
  // 3줄~: 후보자 지원서 → 갱신지원서 → 멤버 규정 설명 확인서 → 인터뷰 후 결제 절차 안내서 → 개인정보 동의서
  "renew-031", "renew-032", "renew-090", "renew-093", "renew-089",
  // 맨 뒤(비매품): 멤버 가이드 → 브로슈어 (1)·(3) 나란히 → 탐구생활 → 멤버 규정 브로슈어(4단접지)
  "renew-051", "renew-027", "renew-043", "renew-028", "renew-050",
];

// 비매품(2026-11-16 지정): 목록 사진 왼쪽 위에 NEW 대신 '비매품' 배지를 단다.
const NOT_FOR_SALE_PRODUCT_IDS = new Set([
  "renew-051", "renew-027", "renew-043", "renew-028", "renew-050", // 멤버 가이드·브로슈어 (1)(3)·탐구생활·멤버 규정 브로슈어
  "renew-096", "renew-013", // 워크북 2종
  "renew-031", "renew-032", "renew-090", "renew-093", // 후보자 지원서·갱신지원서·멤버 규정 설명 확인서·인터뷰 후 결제 절차 안내서
  "renew-004", "renew-014", "renew-015", "renew-022", "renew-016", // 화이트 머그·텀블러(세이지그린)·서비스 벨·스마트 폰링·파일 타공기
  "renew-089", // 개인정보의 수집, 이용, 제공 및 마케팅 활용 동의서
  "renew-021", // 멤버팩(옛 이름: BNI 웰컴 기프트 박스 세트)
]);
// NEW 배지(2026-11-16 지정): 이 3개에만 단다. 그 밖의 상품에는 달지 않는다.
// 웰컴 머그 & 파우치 세트 · 웰컴팩 파우치 (레드) · BNI KOREA 텀블러 머그 (대나무 뚜껑)
const NEW_BADGE_PRODUCT_IDS = new Set(["pouch-mug-set", "welcome-pouch", "mug"]);
export function hasNewBadge(product: Product) {
  return NEW_BADGE_PRODUCT_IDS.has(product.id);
}
export function isNotForSale(product: Product) {
  return NOT_FOR_SALE_PRODUCT_IDS.has(product.id);
}

// 전체 상품 앞 세 줄(2026-11-16 지정, PC 한 줄 4개 기준)
const ALL_PRODUCT_ORDER = [
  // 1줄: 웰컴 머그 & 파우치 세트 → 웰컴팩 파우치(레드) → 텀블러 머그(대나무 뚜껑) → 볼캡
  "pouch-mug-set", "welcome-pouch", "mug", "cap",
  // 2줄: 카라 티셔츠 화이트 → 블랙 → 후드 집업 → 테이블보
  "polo-white", "polo-black", "hoodie", "tablecloth",
  // 3줄: 로고 실크 스카프(레드) → 클래식 넥타이 → 자동 넥타이 → 로고 실크 100% 스카프(화이트)
  "scarf-red", "tie-classic", "tie-auto", "scarf-white",
];

export function defaultProductOrder(product: Product, category: StoreCategory) {
  if (category === "all") {
    const rank = ALL_PRODUCT_ORDER.indexOf(product.id);
    if (rank >= 0) return rank;
    // 그 뒤는 판매 중 → 품절 → 비매품 순. 같은 묶음 안에서는 임시 이름(리뉴얼)을 뒤로.
    const group = product.stock <= 0 ? 1 : NOT_FOR_SALE_PRODUCT_IDS.has(product.id) ? 2 : 0;
    return ALL_PRODUCT_ORDER.length + group * 2 + Number(product.name.includes("(리뉴얼)"));
  }
  if (category === "books") {
    const rank = BOOK_PRODUCT_ORDER.indexOf(product.id);
    return rank < 0 ? BOOK_PRODUCT_ORDER.length + Number(product.name.includes("(리뉴얼)")) : rank;
  }
  if (category === "stationery") {
    const rank = STATIONERY_PRODUCT_ORDER.indexOf(product.id);
    return rank < 0 ? STATIONERY_PRODUCT_ORDER.length : rank;
  }
  if (category === "apparel") {
    const rank = APPAREL_PRODUCT_ORDER.indexOf(product.id);
    return rank < 0 ? APPAREL_PRODUCT_ORDER.length : rank;
  }
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
// 스토어 주소의 앞부분. 평소에는 "/store" 이고,
// 스토어 전용 주소(store.bnikorea.com)로 배포할 때는 NEXT_PUBLIC_STORE_BASE 를 빈 값으로 두어 떼어 낸다.
export const STORE_BASE = process.env.NEXT_PUBLIC_STORE_BASE ?? "/store";
export function storePath(path = "") {
  return `${STORE_BASE}${path}` || "/";
}
export function storeHref(category: StoreCategory = "all") {
  return category === "all" ? storePath("/products") : storePath(`/products?category=${category}`);
}
