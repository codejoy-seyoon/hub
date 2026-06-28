import Link from "next/link";

/* legacy/index.html 헤더 메뉴 그대로 (흰 바 + 회색 pill 네비) */
const NAV = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/training", label: "Training" },
  { href: "/training/schedule", label: "Schedule" },
  { href: "/training/news", label: "News" },
  { href: "/reserve", label: "대관 예약" },
];

export function SiteHeader() {
  return (
    <header className="bni-header">
      <div className="bni-header__inner">
        <Link className="bni-logo" href="/">
          BNI
        </Link>
        <nav className="bni-nav">
          <span className="bni-nav__spacer" aria-hidden="true" />
          <ul className="bni-nav__menu">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <div className="bni-nav__right">
            <Link className="bni-nav__email" href="/orders">
              내 주문
            </Link>
            <Link className="bni-nav__cta" href="/#services">
              서비스 바로가기
            </Link>
            <button className="bni-nav__burger" aria-label="menu">
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
