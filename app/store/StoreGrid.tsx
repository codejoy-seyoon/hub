"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { type Product, productImg } from "@/lib/data/products";
import { STORE_CATEGORIES, matchesCategory, categoryLabel, defaultProductOrder, storeHref } from "@/lib/storefront";
import { won } from "@/lib/format";
import { StoreIcon } from "@/components/store/StoreIcon";

const PAGE_SIZE = 12;

export function StoreGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const category = STORE_CATEGORIES.find((item) => item.id === params.get("category")) ?? STORE_CATEGORIES[0];
  const query = (params.get("q") ?? "").trim().slice(0, 100);
  const sort = ["price-asc", "price-desc", "name"].includes(params.get("sort") ?? "") ? params.get("sort")! : "default";
  const price = ["under30", "30to50", "over50"].includes(params.get("price") ?? "") ? params.get("price")! : "all";
  const inStock = params.get("stock") === "available";

  const filtered = products.filter((product) => {
    if (!matchesCategory(product, category.id)) return false;
    if (query && !`${product.name} ${categoryLabel(product)} ${product.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return false;
    if (inStock && product.stock <= 0) return false;
    if (price === "under30" && product.price >= 30000) return false;
    if (price === "30to50" && (product.price < 30000 || product.price >= 50000)) return false;
    if (price === "over50" && product.price < 50000) return false;
    return true;
  }).sort((a, b) => {
    const defaultOrder = defaultProductOrder(a, category.id) - defaultProductOrder(b, category.id);
    if (sort === "price-asc") return a.price - b.price || defaultOrder;
    if (sort === "price-desc") return b.price - a.price || defaultOrder;
    if (sort === "name") return a.name.localeCompare(b.name, "ko");
    return defaultOrder;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(params.get("page"));
  const page = Number.isSafeInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!query || price !== "all" || inStock || sort !== "default";

  function update(key: string, value: string, scroll = false) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all" || value === "default") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    router.replace(`${storeHref()}${next.size ? `?${next}` : ""}`, { scroll });
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update("q", String(new FormData(event.currentTarget).get("q") ?? "").trim());
  }

  return (
    <>
      <nav className="pd-breadcrumb" aria-label="현재 위치"><Link href="/store">스토어 홈</Link><StoreIcon name="chevron" size={12} /><span>{query ? "검색 결과" : category.label}</span></nav>
      <div className="store-catalog-heading"><h1>{query ? "검색 결과" : category.label}</h1><p>{query ? `‘${query}’에 해당하는 상품을 살펴보세요.` : category.id === "books" ? "도서와 브로슈어, BNI 안내 책자를 만나보세요." : category.id === "stationery" ? "매일의 기록을 위한 노트와 필기구를 만나보세요." : "일상에 함께할 BNI 굿즈를 만나보세요."}</p></div>
      <div className="store-filter-bar">
        <form onSubmit={search} className="store-catalog-search" role="search" aria-label="현재 분류에서 검색" key={query}>
          <StoreIcon name="search" size={18} /><input name="q" aria-label="상품명 검색" placeholder="상품명으로 찾기" defaultValue={query} type="search" maxLength={100} /><button type="submit">검색</button>
        </form>
        <label className="store-select-label"><StoreIcon name="filter" size={17} /><span>가격대</span><select aria-label="가격대" value={price} onChange={(event) => update("price", event.target.value)}><option value="all">전체 가격</option><option value="under30">3만 원 미만</option><option value="30to50">3만–5만 원 미만</option><option value="over50">5만 원 이상</option></select></label>
        <label className="store-stock-filter"><input type="checkbox" checked={inStock} onChange={(event) => update("stock", event.target.checked ? "available" : "")} />구매 가능한 상품만</label>
      </div>
      <div className="store-results-bar">
        <p aria-live="polite" role="status">{query ? <span>‘{query}’ 검색 결과 </span> : <span>{category.label} </span>}<strong>{filtered.length}</strong><span>개</span>{hasFilters && <button className="store-reset" type="button" onClick={() => router.replace(storeHref(category.id), { scroll: false })}>초기화 <StoreIcon name="close" size={12} /></button>}</p>
        <select aria-label="상품 정렬" value={sort} onChange={(event) => update("sort", event.target.value)}><option value="default">{category.id === "ribbon" ? "직책·연차순" : "기본순"}</option><option value="price-asc">낮은 가격순</option><option value="price-desc">높은 가격순</option><option value="name">이름순</option></select>
      </div>
      {shown.length ? <div className="store-product-grid">
        {shown.map((product) => <Link key={product.id} href={`/store/${product.id}${params.size ? `?browse=${encodeURIComponent(params.toString())}` : ""}`} className="store-product-card">
          <div className={`store-product-image ${product.fit === "contain" ? "is-contain" : ""}`}>
            <img src={productImg(product.img)} alt={product.name} loading="lazy" />
            {product.stock <= 0 ? <span className="store-product-tag is-soldout">품절</span> : product.category === "신상품" ? <span className="store-product-tag">NEW</span> : null}
            <span className="store-product-view">상품 자세히 보기 <StoreIcon name="arrow" size={18} /></span>
          </div>
          <div className="store-product-info"><span className="store-product-category">{categoryLabel(product)}</span><h3>{product.name}</h3><p className="store-product-price">{won(product.price)}</p><span className="store-product-extra">{product.stock <= 0 ? "다음 입고를 기다려 주세요" : product.price >= 50000 ? "무료배송" : "5만 원 이상 구매 시 무료배송"}</span></div>
        </Link>)}
      </div> : <div className="store-empty"><StoreIcon name="search" size={32} /><h3>조건에 맞는 상품이 없어요.</h3><p>다른 검색어를 입력하거나 선택한 필터를 해제해 보세요.</p><button type="button" className="store-button store-button-primary" onClick={() => router.replace(storeHref(), { scroll: false })}>전체 상품 보기 <StoreIcon name="arrow" size={18} /></button></div>}
      {pageCount > 1 && <nav className="store-pagination" aria-label="상품 목록 페이지">
        <button type="button" aria-label="이전 페이지" disabled={page === 1} onClick={() => update("page", String(page - 1), true)}><StoreIcon name="chevron" size={16} style={{ transform: "rotate(180deg)" }} /></button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).filter((number) => number === 1 || number === pageCount || Math.abs(number - page) <= 1).map((number, index, pages) => <span key={number}>{index > 0 && number - pages[index - 1] > 1 && <span className="store-pagination-gap">…</span>}<button type="button" aria-label={`${number}페이지`} aria-current={page === number ? "page" : undefined} className={page === number ? "is-active" : ""} onClick={() => update("page", String(number), true)}>{number}</button></span>)}
        <button type="button" aria-label="다음 페이지" disabled={page === pageCount} onClick={() => update("page", String(page + 1), true)}><StoreIcon name="chevron" size={16} /></button>
      </nav>}
    </>
  );
}
