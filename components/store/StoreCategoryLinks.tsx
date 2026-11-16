"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { STORE_CATEGORIES, STORE_NAV_CATEGORIES, storeHref } from "@/lib/storefront";

function Links({ active }: { active?: string }) {
  return STORE_NAV_CATEGORIES.map((category) => (
    <Link key={category.id} href={storeHref(category.id)} aria-label={category.label} aria-current={active === category.id ? "page" : undefined} className={category.id === "sets" ? "store-nav-featured" : ""}>
      {/* 평소엔 한글, 마우스를 올리면 영문 */}
      <span className="store-nav-en" aria-hidden="true">{category.en}</span>
      <span className="store-nav-ko" aria-hidden="true">{category.label}</span>
    </Link>
  ));
}

function CurrentLinks() {
  const pathname = usePathname();
  const params = useSearchParams();
  const category = STORE_CATEGORIES.find((item) => item.id === params.get("category"))?.id ?? "all";
  return <Links active={pathname === storeHref() ? category : undefined} />;
}

export function StoreCategoryLinks() {
  return <Suspense fallback={<Links />}><CurrentLinks /></Suspense>;
}
