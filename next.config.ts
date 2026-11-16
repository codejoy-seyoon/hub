import type { NextConfig } from "next";

// 스토어 전용 배포(store.bnikorea.com): NEXT_PUBLIC_STORE_BASE 가 빈 값이면
// 주소에서 "/store" 를 떼고 스토어만 보여 준다.
//   /            → 스토어 홈      (/store)
//   /products    → 상품 목록      (/store/products)
//   /checkout    → 주문·결제      (/store/checkout)
//   /상품ID      → 상품 상세      (/store/상품ID)
// 허브 홈·교육·전자책·대관은 아직 견본 화면이라 스토어 홈으로 돌려보낸다.
const STORE_ONLY = process.env.NEXT_PUBLIC_STORE_BASE === "";

// 상품 ID 로 보지 않을 첫 마디(이미 다른 화면이 쓰는 이름)
const RESERVED =
  "orders|payments|api|products|checkout|store|training|ebook|reserve|_next";

const nextConfig: NextConfig = {
  // 외부(언스플래시) 이미지 — 대관 공간 사진에서 사용
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    if (!STORE_ONLY) return [];
    return [
      // 예전 주소(/store/...)로 들어와도 새 주소로 보낸다.
      { source: "/store", destination: "/", permanent: false },
      { source: "/store/:path*", destination: "/:path*", permanent: false },
      ...["/training/:path*", "/ebook/:path*", "/reserve/:path*"].map(
        (source) => ({ source, destination: "/", permanent: false }),
      ),
    ];
  },
  async rewrites() {
    if (!STORE_ONLY) return [];
    return {
      beforeFiles: [
        { source: "/", destination: "/store" },
        { source: "/products", destination: "/store/products" },
        { source: "/checkout", destination: "/store/checkout" },
        {
          source: `/:id((?!(?:${RESERVED})$)[a-z0-9][a-z0-9-]*)`,
          destination: "/store/:id",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
