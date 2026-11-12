"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { STORE_CATEGORIES, STORE_NAV_CATEGORIES, storeHref } from "@/lib/storefront";

function Links({ active }: { active?: string }) {
  return STORE_NAV_CATEGORIES.map((category) => (
    <Link key={category.id} href={storeHref(category.id)} aria-current={active === category.id ? "page" : undefined} className={category.id === "sets" ? "store-nav-featured" : ""}>
      {category.label}
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
