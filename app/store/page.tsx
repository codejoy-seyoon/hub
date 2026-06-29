import { PRODUCTS, productImg } from "@/lib/data/products";
import { StoreGrid } from "./StoreGrid";
import { HeroCarousel } from "@/components/store/HeroCarousel";

export const metadata = { title: "BNI KOREA STORE | 공식 굿즈 스토어" };

// 히어로/카테고리 카드 이미지 (Supabase Storage 키)
const HERO = {
  tee: "goods/x-bc6b90.jpg", // 카라티 블랙
  hoodie: "goods/x-bf3d05.png", // 후드집업 앞
  tie: "goods/BNI-Korea_-1-59de74.jpg", // 자동 타이
};

export default function StorePage() {
  return (
    <>
      {/* ===== Hero Carousel ===== */}
      <HeroCarousel />

      {/* ===== Feature (2-column) ===== */}
      <section className="lv-section">
        <div className="lv-container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div
              className="feature-img"
              style={{
                backgroundImage: `url('${productImg(HERO.tee)}')`,
              }}
            />
            <div className="flex items-center justify-center">
              <div className="feature-text text-center">
                <p className="lv-eyebrow">Apparel</p>
                <h2 className="lv-heading">BNI 시그니처 웨어</h2>
                <p className="lv-desc">
                  카라 티셔츠부터 후드 집업, 볼캡까지. BNI KOREA 멤버의 자부심을
                  담은 의류 컬렉션을 만나보세요.
                </p>
                <a href="#productGrid" className="btn lv-btn-dark">
                  의류 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Category cards (2-up) ===== */}
      <section className="lv-section pt-0">
        <div className="lv-container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <a href="#productGrid" className="gift-card">
              <div
                className="gift-img"
                style={{
                  backgroundImage: `url('${productImg(HERO.hoodie)}')`,
                }}
              />
              <div className="gift-overlay text-center">
                <h3 className="gift-title">APPAREL</h3>
                <span className="gift-link">의류 컬렉션 →</span>
              </div>
            </a>
            <a href="#productGrid" className="gift-card">
              <div
                className="gift-img"
                style={{
                  backgroundImage: `url('${productImg(HERO.tie)}')`,
                }}
              />
              <div className="gift-overlay text-center">
                <h3 className="gift-title">ACCESSORIES</h3>
                <span className="gift-link">액세서리 →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ===== Product Grid ===== */}
      <section className="lv-section" id="productGrid-section">
        <div className="lv-container">
          <h2 className="lv-heading mb-2 text-center">BNI KOREA 굿즈</h2>
          <p className="lv-desc mb-4 text-center">멤버를 위한 공식 굿즈 전 품목</p>
          <StoreGrid products={PRODUCTS} />
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <section className="lv-newsletter">
        <div className="lv-container">
          <h2 className="lv-heading mb-3">신상품 소식 받기</h2>
          <p className="lv-desc mb-4">
            새로운 굿즈와 한정 컬렉션 소식을 가장 먼저 받아보세요.
          </p>
          <form className="newsletter-form" action="#">
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="이메일 주소"
                aria-label="이메일 주소"
                required
              />
              <button className="btn lv-btn-dark" type="submit">
                구독하기
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
