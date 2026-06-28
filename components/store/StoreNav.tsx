"use client";

import { useState } from "react";
import Link from "next/link";

const MENU = ["전체", "의류", "액세서리", "리빙", "뱃지"];

export function StoreNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="lv-navbar">
      <div className="lv-container flex items-center gap-3 px-3 lg:px-4">
        {/* 모바일 토글 */}
        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
          className="order-1 border-0 bg-transparent p-0 text-2xl lg:hidden"
        >
          <i className="bi bi-list" />
        </button>

        {/* 로고 */}
        <Link
          href="/"
          className="navbar-brand order-2 mx-auto lg:order-1 lg:mx-0"
        >
          BNI KOREA
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="order-2 mx-auto hidden list-none items-center gap-0 p-0 lg:flex">
          {MENU.map((m) => (
            <li key={m}>
              <a className="nav-link" href="#productGrid">
                {m}
              </a>
            </li>
          ))}
        </ul>

        {/* 우측 아이콘 */}
        <ul className="lv-icons order-3 m-0 flex list-none flex-row items-center gap-0 p-0">
          <li>
            <a className="nav-link px-2" href="#productGrid" aria-label="검색">
              <i className="bi bi-search" />
            </a>
          </li>
          <li className="hidden sm:block">
            <a className="nav-link px-2" href="/orders" aria-label="내 주문">
              <i className="bi bi-person" />
            </a>
          </li>
          <li className="hidden sm:block">
            <a className="nav-link px-2" href="#productGrid" aria-label="찜">
              <i className="bi bi-heart" />
            </a>
          </li>
          <li>
            <a className="nav-link px-2" href="#productGrid" aria-label="장바구니">
              <i className="bi bi-bag" />
            </a>
          </li>
        </ul>
      </div>

      {/* 모바일 펼침 메뉴 */}
      {open && (
        <div className="lv-container mt-3 border-t border-[var(--lv-line)] px-3 pt-2 lg:hidden">
          <ul className="flex list-none flex-col items-center gap-1 p-0">
            {MENU.map((m) => (
              <li key={m}>
                <a
                  className="nav-link"
                  href="#productGrid"
                  onClick={() => setOpen(false)}
                >
                  {m}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
