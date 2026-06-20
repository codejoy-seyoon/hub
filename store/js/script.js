/* =========================================================
   LOUIS VUITTON 클론 - script.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     1) 상품 그리드 동적 생성
     --------------------------------------------------------- */
  const products = [
    {
      name: "Neverfull MM",
      price: "₩2,690,000",
      img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Capucines BB",
      price: "₩8,150,000",
      img: "https://images.unsplash.com/photo-1591348122449-02525d70379b?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Keepall 50",
      price: "₩3,420,000",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Pochette Métis",
      price: "₩3,250,000",
      img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Speedy 25",
      price: "₩2,480,000",
      img: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Twist MM",
      price: "₩6,900,000",
      img: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "OnTheGo GM",
      price: "₩4,150,000",
      img: "https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Alma BB",
      price: "₩2,950,000",
      img: "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const grid = document.getElementById("productGrid");
  if (grid) {
    products.forEach((p) => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-4 col-lg-3";
      col.innerHTML = `
        <div class="product-card">
          <div class="product-thumb" style="background-image:url('${p.img}')"></div>
          <p class="product-name">${p.name}</p>
          <p class="product-price">${p.price}</p>
        </div>`;
      grid.appendChild(col);
    });
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
        alert("가입해 주셔서 감사합니다! (" + input.value + ")");
        input.value = "";
      }
    });
  }
});
