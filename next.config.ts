import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부(언스플래시) 이미지 — 대관 공간 사진에서 사용
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
