"use client";
import { useState } from "react";

export function ProductGallery({ images, name, contain }: { images: string[]; name: string; contain: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <div className="store-gallery">
      <div className={`store-gallery-main ${contain ? "is-contain" : ""}`}>
        <img src={images[active]} alt={`${name} · 사진 ${active + 1}`} fetchPriority="high" />
        {images.length > 1 && <span className="store-gallery-count" aria-live="polite">{active + 1} / {images.length}</span>}
      </div>
      {images.length > 1 && <>
        <div className="store-gallery-thumbs" aria-label="상품 사진 선택">
          {images.map((src, index) => <button type="button" key={src} aria-label={`상품 사진 ${index + 1} 보기`} aria-pressed={active === index} onClick={() => setActive(index)}><img src={src} alt="" loading="lazy" /></button>)}
        </div>
        <p className="store-gallery-help">작은 사진을 눌러 상품을 더 자세히 살펴보세요.</p>
      </>}
    </div>
  );
}
