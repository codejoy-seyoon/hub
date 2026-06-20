// books.js — Pagely 도서 데이터 단일 소스 + 메인/목록 ↔ 상세 연결 + 상세 렌더링
(function () {
    "use strict";
  
    const BOOKS = [
      {
        id: "fastlane", title: "부의 추월차선", author: "엠제이 드마코 저 · 신소영 역", category: "경제경영",
        publisher: "토트", pubDate: "2013.01", pages: "472p", format: "EPUB/PDF",
        price: 12000, originalPrice: 15000, rating: 4.7, reviewCount: 1243,
        cover: "images/book_economy1.png",
        desc:
          "당신은 지금 어느 차선을 달리고 있는가? 세계적인 베스트셀러이자 재테크 분야의 " +
          "바이블로 불리는 이 책은 부자가 되는 진짜 방법을 알려준다. 저자 엠제이 드마코는 " +
          "단순히 아끼고 절약하는 방식이 아닌, 빠른 부를 만드는 시스템 구축의 중요성을 강조한다.<br /><br />" +
          "평범한 사람들이 평생 일하고도 부자가 되지 못하는 이유를 '서행차선'이라는 개념으로 " +
          "날카롭게 분석하며, 누구나 인생의 '추월차선'으로 갈아탈 수 있는 구체적인 로드맵을 제시한다.",
        toc: [
          { part: "1부 — 부의 잘못된 지도", lines: [["1장. 나는 어떻게 백만장자가 되었나", "p.18"], ["2장. 부의 신화와 수학", "p.34"], ["3장. 느린 차선의 치명적 결함", "p.52"]] },
          { part: "2부 — 부의 추월차선으로 갈아타기", lines: [["4장. 추월차선의 사고방식", "p.88"], ["5장. 부의 5가지 씨앗", "p.110"]] },
          { part: "3부 — 시스템을 만드는 법", lines: [["6장. 돈을 만드는 시스템", "p.158"], ["7장. 자동화의 힘", "p.182"]] },
          { part: "4부 — 재정적 자유를 향한 로드맵", lines: [["8장. 자유를 향한 마지막 관문", "p.420"], ["9장. 지금 시작하라", "p.448"]] }
        ]
      },
      {
        id: "fastlane2", title: "부의 추월차선 2", author: "엠제이 드마코 저", category: "경제경영",
        publisher: "토트", pubDate: "2018.03", pages: "440p", format: "EPUB/PDF",
        price: 13000, originalPrice: 16000, rating: 4.6, reviewCount: 712,
        cover: "images/book_economy1.png",
        desc:
          "'부의 추월차선' 그 후, 시스템을 만든 사람들이 마주하는 다음 단계. 부를 지키고 " +
          "키우며 자유를 완성하는 법을 더 깊이 있게 풀어낸 후속작.<br /><br />" +
          "한 번의 성공을 평생의 시스템으로 바꾸는 실전 전략을 담았다.",
        toc: [
          { part: "1부 — 추월차선 그 후", lines: [["1장. 도착이 아닌 시작", "p.16"], ["2장. 부를 지키는 법", "p.44"]] },
          { part: "2부 — 자유의 완성", lines: [["3장. 시간이라는 자산", "p.92"], ["4장. 다음 세대를 위한 시스템", "p.150"]] }
        ]
      },
      {
        id: "atomic-habits", title: "아주 작은 습관의 힘", author: "제임스 클리어 저", category: "자기개발",
        publisher: "비즈니스북스", pubDate: "2019.02", pages: "320p", format: "EPUB/PDF",
        price: 13500, originalPrice: 16000, rating: 4.8, reviewCount: 2105,
        cover: "images/book_selfdev1.png",
        desc:
          "매일 1%의 작은 변화가 만들어내는 놀라운 복리의 힘. 좋은 습관은 쉽게 만들고 나쁜 습관은 " +
          "자연스럽게 버리는, 과학적이고 실천적인 행동 설계의 모든 것을 담았다.<br /><br />" +
          "의지력에 기대지 않고 환경과 시스템을 바꿔 변화를 지속시키는 구체적인 방법을 알려준다.",
        toc: [
          { part: "1부 — 습관의 작동 원리", lines: [["1장. 아주 작은 습관의 놀라운 힘", "p.16"], ["2장. 정체성을 바꾸는 습관", "p.42"]] },
          { part: "2부 — 4가지 행동 변화 법칙", lines: [["3장. 분명하게 만들어라", "p.78"], ["4장. 매력적으로 만들어라", "p.120"], ["5장. 쉽게, 그리고 만족스럽게", "p.166"]] }
        ]
      },
      {
        id: "moonlight", title: "달빛 아래 우리", author: "김서연 저", category: "로맨스",
        publisher: "페이지문학", pubDate: "2024.06", pages: "268p", format: "EPUB",
        price: 8900, originalPrice: 11000, rating: 4.5, reviewCount: 642,
        cover: "images/book_romance1.png",
        desc:
          "달빛이 닿는 골목 끝 작은 서점에서 시작된 두 사람의 이야기. 서툴지만 진심이었던 " +
          "첫 마음을 섬세한 문장으로 그려낸 감성 로맨스.<br /><br />" +
          "스쳐 지나갈 뻔한 인연이 책 한 권으로 이어지는, 잔잔하고 따뜻한 사랑 이야기.",
        toc: [
          { part: "1부 — 골목 끝 서점", lines: [["1장. 우연한 첫 만남", "p.12"], ["2장. 빌려간 책", "p.46"]] },
          { part: "2부 — 달빛 아래에서", lines: [["3장. 말하지 못한 마음", "p.92"], ["4장. 우리의 계절", "p.150"]] }
        ]
      },
      {
        id: "moonlight3", title: "달빛 아래 우리 3", author: "김서연 저", category: "로맨스",
        publisher: "페이지문학", pubDate: "2025.02", pages: "276p", format: "EPUB",
        price: 8900, originalPrice: 11000, rating: 4.6, reviewCount: 305,
        cover: "images/book_romance1.png",
        desc:
          "서점 골목에서 시작된 두 사람의 사랑이 맞이한 새로운 계절. 익숙해진 사이에서도 " +
          "변하지 않는 진심을 그린 '달빛 아래 우리' 시리즈의 세 번째 이야기.<br /><br />" +
          "함께하는 일상 속에서 더 깊어지는 사랑을 담은 따뜻한 완결편.",
        toc: [
          { part: "1부 — 새로운 계절", lines: [["1장. 다시 그 골목", "p.12"], ["2장. 변하지 않은 마음", "p.48"]] },
          { part: "2부 — 곁에서", lines: [["3장. 작은 다툼", "p.94"], ["4장. 우리, 계속", "p.152"]] }
        ]
      },
      {
        id: "sword-empire", title: "검과 마법의 제국", author: "이준혁 저", category: "판타지",
        publisher: "페이지판타지", pubDate: "2023.09", pages: "412p", format: "EPUB",
        price: 9500, originalPrice: 12000, rating: 4.6, reviewCount: 988,
        cover: "images/book_fantasy1.png",
        desc:
          "검과 마법이 지배하는 대륙, 몰락한 제국의 마지막 후예가 운명을 건 여정에 나선다. " +
          "장대한 세계관과 숨막히는 전투가 펼쳐지는 본격 판타지.<br /><br />" +
          "잃어버린 왕좌와 대륙의 비밀을 둘러싼 거대한 모험이 시작된다.",
        toc: [
          { part: "1부 — 몰락한 제국", lines: [["1장. 마지막 후예", "p.10"], ["2장. 떠나는 길", "p.52"]] },
          { part: "2부 — 검과 마법", lines: [["3장. 동료들", "p.108"], ["4장. 첫 전투", "p.176"]] }
        ]
      },
      {
        id: "sword-empire2", title: "검과 마법의 제국 2", author: "이준혁 저", category: "판타지",
        publisher: "페이지판타지", pubDate: "2024.03", pages: "428p", format: "EPUB",
        price: 9500, originalPrice: 12000, rating: 4.5, reviewCount: 410,
        cover: "images/book_fantasy1.png",
        desc:
          "제국의 후예가 잃어버린 왕좌를 되찾기 위한 두 번째 여정. 새로운 동료와 더 강력한 적, " +
          "대륙을 뒤흔들 비밀이 드러나는 후속작.<br /><br />" +
          "'검과 마법의 제국' 시리즈의 스케일을 한층 키운 두 번째 이야기.",
        toc: [
          { part: "1부 — 두 번째 여정", lines: [["1장. 돌아온 후예", "p.10"], ["2장. 새로운 동료", "p.54"]] },
          { part: "2부 — 왕좌를 향해", lines: [["3장. 더 강한 적", "p.112"], ["4장. 대륙의 비밀", "p.180"]] }
        ]
      },
      {
        id: "money-psychology", title: "돈의 심리학", author: "모건 하우절 저", category: "경제경영",
        publisher: "인플루엔셜", pubDate: "2021.01", pages: "280p", format: "EPUB/PDF",
        price: 14000, originalPrice: 17000, rating: 4.7, reviewCount: 1532,
        cover: "images/book_economy2.png",
        desc:
          "부는 지식이 아니라 행동의 문제다. 돈을 대하는 인간의 심리와 습관을 19가지 통찰로 " +
          "풀어내며, 평생 흔들리지 않는 자산 관리의 태도를 알려준다.<br /><br />" +
          "복잡한 금융 이론 대신, 부와 행복을 함께 지키는 마음가짐에 대한 이야기.",
        toc: [
          { part: "1부 — 돈을 대하는 마음", lines: [["1장. 아무도 미치지 않았다", "p.14"], ["2장. 행운과 리스크", "p.40"]] },
          { part: "2부 — 부의 태도", lines: [["3장. 결코 충분하지 않다", "p.86"], ["4장. 복리의 마법", "p.132"]] }
        ]
      },
      {
        id: "slamdunk", title: "슬램덩크 완전판", author: "이노우에 타케히코 저", category: "만화",
        publisher: "대원씨아이", pubDate: "2018.11", pages: "200p", format: "EPUB",
        price: 7500, originalPrice: 9000, rating: 4.9, reviewCount: 3120,
        cover: "images/book_comic1.png",
        desc:
          "농구를 시작한 불량소년 강백호와 북산고 농구부의 뜨거운 청춘. 세대를 뛰어넘어 " +
          "사랑받는 전설적 농구 만화의 완전판.<br /><br />" +
          "포기란 없다 — 코트 위에서 성장하는 소년들의 빛나는 순간을 다시 만난다.",
        toc: [
          { part: "1부 — 농구를 시작하다", lines: [["1화. 강백호 등장", "p.6"], ["2화. 풋내기 슛", "p.40"]] },
          { part: "2부 — 북산고 농구부", lines: [["3화. 라이벌", "p.92"], ["4화. 첫 경기", "p.150"]] }
        ]
      },
      {
        id: "miracle-morning", title: "미라클 모닝", author: "할 엘로드 저", category: "자기개발",
        publisher: "한빛비즈", pubDate: "2016.05", pages: "304p", format: "EPUB/PDF",
        price: 11000, originalPrice: 13500, rating: 4.4, reviewCount: 870,
        cover: "images/book_selfdev2.png",
        desc:
          "아침 시간을 바꾸면 인생이 바뀐다. 누구나 따라 할 수 있는 6가지 아침 습관으로 " +
          "하루를, 그리고 삶 전체를 변화시키는 방법을 제시한다.<br /><br />" +
          "평범한 아침을 인생 최고의 시간으로 만드는 가장 확실한 루틴.",
        toc: [
          { part: "1부 — 아침을 바꾸는 이유", lines: [["1장. 인생을 바꾸는 아침", "p.12"], ["2장. 기상의 기술", "p.40"]] },
          { part: "2부 — 6가지 아침 습관", lines: [["3장. 침묵·확언·시각화", "p.78"], ["4장. 운동·독서·쓰기", "p.120"]] }
        ]
      },
      {
        id: "miracle-evening", title: "미라클 이브닝", author: "할 엘로드 저", category: "자기개발",
        publisher: "한빛비즈", pubDate: "2020.09", pages: "288p", format: "EPUB/PDF",
        price: 11000, originalPrice: 13500, rating: 4.3, reviewCount: 521,
        cover: "images/book_selfdev2.png",
        desc:
          "하루를 어떻게 마무리하느냐가 내일을 결정한다. '미라클 모닝'의 저자가 제안하는 " +
          "저녁 루틴으로, 잠들기 전 시간을 회복과 성장의 시간으로 바꾼다.<br /><br />" +
          "지친 하루 끝에서 나를 다시 채우는 6가지 저녁 습관.",
        toc: [
          { part: "1부 — 저녁을 되찾다", lines: [["1장. 하루의 마침표", "p.12"], ["2장. 회복의 기술", "p.40"]] },
          { part: "2부 — 6가지 저녁 습관", lines: [["3장. 돌아보기·비우기", "p.76"], ["4장. 준비·휴식", "p.118"]] }
        ]
      },
      {
        id: "zero-to-one", title: "제로 투 원", author: "피터 틸 저", category: "경제경영",
        publisher: "한국경제신문", pubDate: "2014.11", pages: "252p", format: "EPUB/PDF",
        price: 13000, originalPrice: 15500, rating: 4.6, reviewCount: 1340,
        cover: "images/book_economy3.png",
        desc:
          "경쟁하지 말고 독점하라. 0에서 1을 만드는 창업가의 사고법과, 미래를 만드는 " +
          "스타트업의 비밀을 실리콘밸리 거물이 직접 들려준다.<br /><br />" +
          "남들이 보지 못한 진실을 찾아 새로운 가치를 창조하는 법에 관한 책.",
        toc: [
          { part: "1부 — 미래를 만드는 질문", lines: [["1장. 0에서 1로", "p.10"], ["2장. 경쟁이라는 환상", "p.44"]] },
          { part: "2부 — 독점의 기술", lines: [["3장. 스타트업의 비밀", "p.96"], ["4장. 마지막 우위", "p.158"]] }
        ]
      }
    ];
  
    const DEFAULT_ID = "fastlane";
    const FALLBACK_COVER = "images/book_economy1.png";
  
    const BY_ID = {};
    const BY_TITLE = {};
    BOOKS.forEach(function (b) {
      BY_ID[b.id] = b;
      BY_TITLE[b.title] = b;
    });
  
    function formatPrice(n) {
      return "₩" + Number(n).toLocaleString("ko-KR");
    }
  
    function starsHtml(rating) {
      let html = "";
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += '<i class="bi bi-star-fill"></i>';
        else if (rating >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
        else html += '<i class="bi bi-star"></i>';
      }
      return html;
    }
  
    function getParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    }
  
    function detailUrl(title) {
      const book = BY_TITLE[title];
      if (book) return "detail.html?id=" + encodeURIComponent(book.id);
      return "detail.html";
    }
  
    // ── 1) 카드 링크 자동 연결 ──
    // HTML 에 이미 detail.html?id=XXX 가 하드코딩되어 있으므로
    // 카드 조작은 하지 않는다. (링크를 가로채지 않음)
    function enhanceCards() {
      document.querySelectorAll(".book-card").forEach(function (card) {
        // 표지 이미지가 비어 있을 때만 books 데이터로 채운다 (상세페이지 추천 카드 등)
        const titleEl = card.querySelector(".book-title");
        if (!titleEl) return;
        const title = titleEl.textContent.trim();
        const book = BY_TITLE[title];
        const cover = card.querySelector(".book-cover");
        if (book && cover && !cover.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = title;
          img.onerror = function () { this.onerror = null; this.src = FALLBACK_COVER; };
          img.src = book.cover;
          cover.insertBefore(img, cover.firstChild);
        }
      });
    }
  
    // ── 2) 상세 페이지 렌더링 ──
    function renderToc(toc) {
      const acc = document.getElementById("tocAccordion");
      if (!acc || !toc) return;
      acc.innerHTML = toc.map(function (part, i) {
        const colId = "toc" + (i + 1);
        const open = i === 0;
        const lines = part.lines.map(function (l) {
          return '<div class="toc-line"><span>' + l[0] +
            '</span><span class="toc-page">' + l[1] + "</span></div>";
        }).join("");
        return (
          '<div class="accordion-item">' +
          '<h3 class="accordion-header">' +
          '<button class="accordion-button' + (open ? "" : " collapsed") +
          '" type="button" data-bs-toggle="collapse" data-bs-target="#' + colId + '">' +
          part.part + "</button></h3>" +
          '<div id="' + colId + '" class="accordion-collapse collapse' +
          (open ? " show" : "") + '" data-bs-parent="#tocAccordion">' +
          '<div class="accordion-body">' + lines + "</div></div></div>"
        );
      }).join("");
    }
  
    function setText(selector, text) {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    }
  
    function renderDetail(book) {
      document.title = book.title + " — Pagely";
      setText(".genre-tag", book.category);
      setText(".detail-title", book.title);
      setText(".detail-author", book.author);
  
      const headerStars = document.querySelector(".detail-stars");
      if (headerStars) {
        headerStars.innerHTML = starsHtml(book.rating) +
          '<span class="review-count">' + book.rating +
          " (리뷰 " + book.reviewCount.toLocaleString("ko-KR") + "개)</span>";
      }
  
      const vals = document.querySelectorAll(".info-row .info-val");
      if (vals.length >= 4) {
        vals[0].textContent = book.publisher;
        vals[1].textContent = book.pubDate;
        vals[2].textContent = book.pages;
        vals[3].textContent = book.format;
      }
  
      const priceEl = document.querySelector(".detail-price");
      if (priceEl) {
        let html = formatPrice(book.price) + ' <span class="price-sub">';
        if (book.originalPrice)
          html += '<del class="text-muted">' + formatPrice(book.originalPrice) + "</del> · ";
        html += "구독 시 무료</span>";
        priceEl.innerHTML = html;
      }
  
      const cover = document.querySelector(".detail-cover-img");
      if (cover) {
        cover.alt = book.title + " 표지";
        cover.onerror = function () { this.onerror = null; this.src = FALLBACK_COVER; };
        cover.src = book.cover;
      }
  
      const desc = document.querySelector(".detail-desc");
      if (desc) desc.innerHTML = book.desc;
  
      const crumbs = document.querySelectorAll(".breadcrumb .breadcrumb-item");
      if (crumbs.length >= 3) {
        const catLink = crumbs[1].querySelector("a");
        if (catLink) catLink.textContent = book.category;
        crumbs[2].textContent = book.title;
      }
  
      setText(".review-score", book.rating);
      const summary = document.querySelector(".review-summary");
      if (summary) {
        const summaryStars = summary.querySelector(".detail-stars");
        if (summaryStars) summaryStars.innerHTML = starsHtml(book.rating);
        const countEl = summary.querySelector(".text-muted");
        if (countEl) countEl.textContent = "리뷰 " + book.reviewCount.toLocaleString("ko-KR") + "개";
      }
  
      renderToc(book.toc);
    }
  
    // ── 실행 ──
    enhanceCards();
  
    if (document.querySelector(".detail-title")) {
      const book =
        BY_ID[getParam("id")] ||
        BY_TITLE[getParam("book")] ||
        BY_ID[DEFAULT_ID];
      renderDetail(book);
      window.PAGELY_BOOK = { id: book.id, name: book.title, amount: book.price };
      // 렌더링 완료 → 본문 페이드인 (깜빡임 방지)
      document.body.classList.remove("detail-loading");
    }
  
    window.PAGELY_BOOKS = BOOKS;
  })();