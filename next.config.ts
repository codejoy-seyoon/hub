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
  "orders|payments|api|products|checkout|store|event|training|ebook|reserve|_next";

// 이벤트 허브(event.bnikorea.com): 이 주소로 들어오면 주소에서 "/event" 를 뗀다.
//   /                 → 행사 목록   (/event)
//   /nc27             → 행사 페이지 (/event/nc27)
//   /nc27/checkout    → 주문·결제   (/event/nc27/checkout)
// 스토어 규칙보다 먼저 본다. 스토어 주소에서는 "/event" 를 숨긴다(STORE_ONLY 일 때).
const EVENT_HOST = "event.bnikorea.com";
const ON_EVENT = [{ type: "host" as const, value: EVENT_HOST }];
// The lookahead must stop at a segment boundary too (not only end of path): on Cloudflare (OpenNext)
// rewrites are applied again to the rewritten path, so /event/conference or /api/orders must never
// be read as code=event / code=api by the two-segment rules below.
const EVENT_CODE = `:code((?!(?:${RESERVED})(?:$|\/))[a-z0-9][a-z0-9-]*)`;
const eventRedirects = [
  { source: "/event", has: ON_EVENT, destination: "/", permanent: false },
  { source: "/event/:path*", has: ON_EVENT, destination: "/:path*", permanent: false },
  ...["/products", "/checkout", "/store", "/store/:path*"].map((source) => ({
    source,
    has: ON_EVENT,
    destination: "/",
    permanent: false,
  })),
];
const eventRewrites = [
  { source: "/", has: ON_EVENT, destination: "/event" },
  { source: `/${EVENT_CODE}`, has: ON_EVENT, destination: "/event/:code" },
  { source: `/${EVENT_CODE}/checkout`, has: ON_EVENT, destination: "/event/:code/checkout" },
  // 티켓 상세페이지: /nc27/ticket-id
  { source: `/${EVENT_CODE}/:ticket([a-z0-9][a-z0-9-]*)`, has: ON_EVENT, destination: "/event/:code/:ticket" },
];

const nextConfig: NextConfig = {
  // 외부(언스플래시) 이미지 — 대관 공간 사진에서 사용
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    if (!STORE_ONLY) return eventRedirects;
    return [
      ...eventRedirects,
      // 스토어 주소에서는 행사 화면을 보여 주지 않는다.
      ...["/event", "/event/:path*"].map((source) => ({
        source,
        missing: ON_EVENT,
        destination: "/",
        permanent: false,
      })),
      // 예전 주소(/store/...)로 들어와도 새 주소로 보낸다.
      { source: "/store", destination: "/", permanent: false },
      { source: "/store/:path*", destination: "/:path*", permanent: false },
      ...["/training/:path*", "/ebook/:path*", "/reserve/:path*"].map(
        (source) => ({ source, destination: "/", permanent: false }),
      ),
    ];
  },
  async rewrites() {
    if (!STORE_ONLY) return { beforeFiles: eventRewrites, afterFiles: [], fallback: [] };
    return {
      beforeFiles: [
        ...eventRewrites,
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
