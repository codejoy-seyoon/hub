// viewer.js — Pagely 전자책 뷰어
(function () {
    "use strict";
  
    // ── 어떤 책을 읽을지 결정 (URL 의 ?id=, 없으면 기본 도서) ──
    const catalog = window.PAGELY_BOOKS || [];
    function getParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    }
    const requestedId = getParam("id");
    const book =
      catalog.find(function (b) { return b.id === requestedId; }) ||
      catalog.find(function (b) { return b.id === "fastlane"; }) ||
      catalog[0] ||
      null;
  
    // ── 본문 데이터 구성 ──
    function buildPages(b) {
      if (!b) return [{ title: "미리보기", paragraphs: ["표시할 도서를 찾을 수 없습니다."] }];
      if (b.preview && b.preview.length) return b.preview;
  
      const pages = [];
      const intro = String(b.desc || "")
        .split(/<br\s*\/?>/i)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      pages.push({
        title: "프롤로그 — " + b.title,
        paragraphs: intro.length ? intro : ["미리보기를 준비 중입니다."],
      });
      (b.toc || []).forEach(function (part) {
        const paras = ["이 장에서는 다음 내용을 다룹니다."];
        part.lines.forEach(function (l) { paras.push("· " + l[0] + "  (" + l[1] + ")"); });
        pages.push({ title: part.part, paragraphs: paras });
      });
      return pages;
    }
    const pages = buildPages(book);
  
    // ── 헤더 / 문서 제목 ──
    if (book) {
      document.title = book.title + " — 뷰어 · Pagely";
      const titleEl = document.querySelector(".viewer-book-title");
      if (titleEl) titleEl.textContent = book.title;
      const authorEl = document.querySelector(".viewer-book-author");
      if (authorEl) authorEl.textContent = String(book.author || "").split(" 저")[0].trim();
  
      // 뒤로가기 링크: 해당 도서 상세 페이지로
      const backLink = document.getElementById("viewerBack");
      if (backLink && book.id)
        backLink.href = "detail.html?id=" + encodeURIComponent(book.id);
    }
  
    // ── 상태 ──
    let current = 0;
    let fontSize = 17;
    const themes = ["", "theme-sepia", "theme-dark"];
    let themeIndex = 0;
  
    // ── 요소 ──
    const body        = document.getElementById("viewerBody");
    const pageEl      = document.getElementById("viewerPage");
    const indicator   = document.getElementById("pageIndicator");
    const progressBar = document.getElementById("progressBar");
    const prevBtn     = document.getElementById("prevPage");
    const nextBtn     = document.getElementById("nextPage");
  
    // ── 렌더 ──
    function render() {
      const page = pages[current];
      let html = "<h2>" + page.title + "</h2>";
      page.paragraphs.forEach(function (p) {
        html += "<p>" + p + "</p>";
      });
      if (current === pages.length - 1) {
        html +=
          '<div class="reader-note"><i class="bi bi-info-circle"></i> ' +
          "여기까지는 구독 회원을 위한 미리보기입니다. " +
          "전체 내용은 도서를 소장하거나 구독을 이어가면 계속 읽을 수 있어요.</div>";
      }
      pageEl.innerHTML = html;
      pageEl.scrollTop = 0;
  
      indicator.textContent = (current + 1) + " / " + pages.length;
      progressBar.style.width = ((current + 1) / pages.length) * 100 + "%";
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === pages.length - 1;
    }
  
    // ── 페이지 이동 ──
    function go(delta) {
      const next = current + delta;
      if (next < 0 || next >= pages.length) return;
      current = next;
      render();
    }
  
    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });
  
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  go(-1);
      if (e.key === "ArrowRight") go(1);
    });
  
    // ── 글자 크기 ──
    function applyFont() {
      pageEl.style.setProperty("--reader-font", fontSize + "px");
    }
  
    document.getElementById("fontUp").addEventListener("click", function () {
      fontSize = Math.min(fontSize + 1, 26);
      applyFont();
    });
    document.getElementById("fontDown").addEventListener("click", function () {
      fontSize = Math.max(fontSize - 1, 13);
      applyFont();
    });
  
    // ── 배경 테마 ──
    document.getElementById("themeToggle").addEventListener("click", function () {
      body.classList.remove(themes[themeIndex] || "no-theme");
      themeIndex = (themeIndex + 1) % themes.length;
      if (themes[themeIndex]) body.classList.add(themes[themeIndex]);
      const icon = this.querySelector("i");
      icon.className =
        themeIndex === 2 ? "bi bi-sun"
        : themeIndex === 1 ? "bi bi-book"
        : "bi bi-moon-stars";
    });
  
    // ── 초기화 ──
    applyFont();
    render();
  })();