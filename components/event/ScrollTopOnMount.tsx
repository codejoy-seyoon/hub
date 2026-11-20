"use client";

import { useEffect } from "react";

/**
 * 페이지에 들어오면 맨 위에서 시작하게 한다.
 * 행사 메뉴 띠가 화면 위에 붙어 있어서(sticky), 다른 페이지에서 스크롤을 내린 채 넘어오면
 * 새 페이지가 중간부터 보이는 일이 있었다.
 */
export function ScrollTopOnMount() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
  return null;
}
