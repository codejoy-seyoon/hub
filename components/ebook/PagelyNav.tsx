"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = ["전체", "일반", "장르", "만화", "오디오북"];

export function PagelyNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 1단 네비 */}
      <nav className="mainNav">
        <div className="pg-container flex items-center gap-4">
          <Link href="/ebook" className="navbar-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ebook-img/logo_color.png" alt="Pagely" height={34} style={{ height: 34 }} />
          </Link>

          {/* 검색 (데스크탑) */}
          <div className="hidden flex-1 lg:flex">
            <div className="flex w-full">
              <input className="search-input" placeholder="읽고 싶은 책을 검색해보세요" />
              <button className="btn-search" type="button" aria-label="검색">
                <i className="bi bi-search" />
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <Link href="/orders" className="nav-icon hidden lg:flex">
              <i className="bi bi-person" />
              <span className="ms-1 text-sm">내 주문</span>
            </Link>
            <Link href="/ebook" className="btn-primary-custom hidden lg:inline-flex">
              회원가입
            </Link>
            <Link href="/ebook" className="nav-icon hidden lg:flex">
              <i className="bi bi-bag" />
              <span className="ms-1 text-sm">장바구니</span>
            </Link>
            <button
              type="button"
              className="border-0 bg-transparent text-2xl lg:hidden"
              aria-label="메뉴"
              onClick={() => setOpen((v) => !v)}
            >
              <i className="bi bi-list" />
            </button>
          </div>
        </div>

        {/* 모바일 펼침 */}
        {open && (
          <div className="pg-container mt-3 lg:hidden">
            <div className="mb-3 flex w-full">
              <input className="search-input" placeholder="책 검색" />
              <button className="btn-search" type="button" aria-label="검색">
                <i className="bi bi-search" />
              </button>
            </div>
            <ul className="flex list-none flex-col gap-1 p-0">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link className="category-link" href="/ebook" onClick={() => setOpen(false)}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* 2단 카테고리 네비 (데스크탑) */}
      <div className="category-nav hidden lg:block">
        <div className="pg-container">
          <ul className="category-menu">
            {CATEGORIES.map((c, i) => (
              <li key={c}>
                <Link href="/ebook" className={`category-link ${i === 0 ? "active" : ""}`}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
