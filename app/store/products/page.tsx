import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PRODUCTS } from "@/lib/data/products";
import { StoreGrid } from "../StoreGrid";

export const metadata = { title: "상품 둘러보기 | BNI STORE" };

export default async function StoreProductsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // 이전 액세서리 링크도 통합된 의류 목록으로 연결한다.
  if (params.category === "accessories") {
    const next = new URLSearchParams({ category: "apparel" });
    for (const key of ["q", "price", "sort", "stock"]) {
      const value = params[key];
      if (typeof value === "string" && value) next.set(key, value.slice(0, 100));
    }
    redirect(`/store/products?${next}`);
  }

  return (
    <main id="store-main" className="store-catalog-page store-wrap">
      <Suspense fallback={<p className="store-loading">상품을 불러오고 있습니다.</p>}>
        <StoreGrid products={PRODUCTS} />
      </Suspense>
    </main>
  );
}
