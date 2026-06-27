import Link from "next/link";

const NAV = [
  { href: "/store", label: "스토어" },
  { href: "/reserve", label: "대관 예약" },
  { href: "/training", label: "트레이닝" },
  { href: "/ebook", label: "이북" },
  { href: "/orders", label: "내 주문" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-bni-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          BNI <span className="text-bni-red">KOREA</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-bni-body transition hover:bg-bni-red-soft hover:text-bni-red"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
