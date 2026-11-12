"use client";

import { useEffect, useRef, useState } from "react";
import { storeHref } from "@/lib/storefront";
import { StoreIcon } from "./StoreIcon";

export function StoreHeaderSearch() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="store-header-search-control" ref={container}>
      <button ref={trigger} className="store-search-toggle" type="button" aria-label={open ? "상품 검색 닫기" : "상품 검색 열기"} aria-expanded={open} aria-controls="store-header-search-panel" onClick={() => setOpen(!open)}>
        <StoreIcon name={open ? "close" : "search"} />
      </button>
      <div id="store-header-search-panel" className="store-header-search-panel" hidden={!open}>
        <form action={storeHref()} method="get" className="store-header-search" role="search" aria-label="전체 상품 검색">
          <input ref={input} name="q" type="search" placeholder="상품명으로 찾기" aria-label="상품 검색" maxLength={100} />
          <button type="submit" aria-label="검색하기"><StoreIcon name="search" /></button>
        </form>
      </div>
    </div>
  );
}
