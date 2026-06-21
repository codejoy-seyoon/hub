/* =========================================================
   BNI Korea Store - script.js
   상품/재고를 데이터로 분리해 추후 DB 연동이 쉽도록 구성.
   - PRODUCTS 배열을 fetch('/api/products') 등으로 교체하면 끝.
   - stock 값(0 이면 SOLD OUT)으로 품절/재고 표시가 자동 처리됨.
   ========================================================= */

/* 상품 이미지 폴더 */
const IMG_BASE = "img/bni_korea_goods_img/";

/* ---------------------------------------------------------
   상품 불러오기
   상품/재고 데이터는 공통 데이터 레이어(shared/data.js)에서 읽는다.
   → 어드민 페이지에서 수정하면 이 스토어에 그대로 반영된다.
   ▶ DB 연동 시에는 shared/data.js 의 getProducts() 내부만
     fetch("/api/products") 로 교체하면 된다.
   --------------------------------------------------------- */
async function loadProducts() {
  if (window.BNIData && typeof BNIData.getProducts === "function") {
    return BNIData.getProducts();
  }
  console.warn("BNIData 를 찾을 수 없습니다. shared/data.js 로드를 확인하세요.");
  return [];
}

/* 가격 포맷: 18000 -> ₩18,000 */
function formatPrice(won) {
  return "₩" + Number(won).toLocaleString("ko-KR");
}

/* 이미지 경로 (공백/한글 안전 인코딩) */
function imgUrl(file) {
  return encodeURI(IMG_BASE + file);
}

/* 카테고리 목록 (전체 + 데이터에 등장한 순서) */
function getCategories(products) {
  const seen = [];
  products.forEach((p) => {
    if (!seen.includes(p.category)) seen.push(p.category);
  });
  return ["전체", ...seen];
}

/* 상품 카드 한 장 렌더 */
function renderCard(p) {
  const soldOut = !p.stock || p.stock <= 0;
  const lowStock = !soldOut && p.stock <= 5;

  const col = document.createElement("div");
  col.className = "col-6 col-md-4 col-lg-3";
  col.dataset.category = p.category;

  col.innerHTML = `
    <div class="product-card${soldOut ? " is-soldout" : ""}">
      <div class="product-thumb" style="background-image:url('${imgUrl(p.img)}')">
        ${soldOut ? '<span class="soldout-badge">SOLD OUT</span>' : ""}
        ${lowStock ? `<span class="stock-badge">품절임박 ${p.stock}개</span>` : ""}
      </div>
      <p class="product-cat">${p.category}</p>
      <p class="product-name">${p.name}</p>
      <p class="product-price">${formatPrice(p.price)}</p>
      <button class="btn lv-btn-dark product-buy" data-id="${p.id}" ${soldOut ? "disabled" : ""}>
        ${soldOut ? "품절" : "구매하기"}
      </button>
    </div>`;
  return col;
}

document.addEventListener("DOMContentLoaded", async () => {
  /* ---------------------------------------------------------
     1) 상품 그리드 + 카테고리 필터
     --------------------------------------------------------- */
  const grid = document.getElementById("productGrid");
  const filterBar = document.getElementById("categoryFilter");

  if (grid) {
    let products = await loadProducts();
    let currentCat = "전체";

    const draw = (cat) => {
      currentCat = cat;
      grid.innerHTML = "";
      products
        .filter((p) => cat === "전체" || p.category === cat)
        .forEach((p) => grid.appendChild(renderCard(p)));
    };

    // 카테고리 필터 버튼
    if (filterBar) {
      const cats = getCategories(products);
      cats.forEach((cat, i) => {
        const btn = document.createElement("button");
        btn.className = "cat-chip" + (i === 0 ? " active" : "");
        btn.textContent = cat;
        btn.addEventListener("click", () => {
          filterBar
            .querySelectorAll(".cat-chip")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          draw(cat);
        });
        filterBar.appendChild(btn);
      });
    }

    draw("전체");

    /* -------------------------------------------------------
       구매(체크아웃) — 이름/전화로 유저를 식별해 주문을 기록한다.
       주문 저장·재고 차감·여정(activity) 기록은 BNIData.addOrder가 처리.
       ------------------------------------------------------- */
    const checkout = document.getElementById("checkoutModal");
    let buyingId = null;

    grid.addEventListener("click", (e) => {
      const buy = e.target.closest(".product-buy");
      if (!buy || buy.disabled) return;
      buyingId = buy.dataset.id;
      const p = products.find((x) => x.id === buyingId);
      if (!p || !checkout) return;
      checkout.querySelector("#coProduct").textContent = p.name;
      checkout.querySelector("#coPrice").textContent = formatPrice(p.price);
      checkout.querySelector("#coName").value = "";
      checkout.querySelector("#coPhone").value = "";
      checkout.querySelector("#coEmail").value = "";
      checkout.classList.add("open");
      checkout.querySelector("#coName").focus();
    });

    if (checkout) {
      const close = () => checkout.classList.remove("open");
      checkout.querySelector("#coCancel").addEventListener("click", close);
      checkout.addEventListener("click", (e) => {
        if (e.target === checkout) close();
      });

      checkout.querySelector("#checkoutForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = checkout.querySelector("#coName").value.trim();
        const phone = checkout.querySelector("#coPhone").value.trim();
        const email = checkout.querySelector("#coEmail").value.trim();
        const p = products.find((x) => x.id === buyingId);
        if (!name || !phone || !p) return;
        if (!window.BNIData) {
          alert("데이터 레이어를 불러오지 못했습니다.");
          return;
        }
        const user = BNIData.upsertUser({ name, phone, email });
        BNIData.addOrder(user.id, [
          { product_id: p.id, qty: 1, unit_price: p.price },
        ]);
        close();
        products = BNIData.getProducts(); // 재고 갱신분 반영
        draw(currentCat);
        alert(`주문이 완료되었습니다.\n${p.name}\n${formatPrice(p.price)}`);
      });
    }
  }

  /* ---------------------------------------------------------
     2) Back to top 버튼
     --------------------------------------------------------- */
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    window.addEventListener("scroll", () => {
      backBtn.classList.toggle("show", window.scrollY > 400);
    });
    backBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------
     3) 스크롤 시 navbar 그림자
     --------------------------------------------------------- */
  const navbar = document.querySelector(".lv-navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 10 ? "0 2px 12px rgba(0,0,0,0.06)" : "none";
    });
  }

  /* ---------------------------------------------------------
     4) 뉴스레터 가입 (데모 알림)
     --------------------------------------------------------- */
  const form = document.querySelector(".newsletter-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      if (input.value) {
        alert("구독해 주셔서 감사합니다! (" + input.value + ")");
        input.value = "";
      }
    });
  }
});
