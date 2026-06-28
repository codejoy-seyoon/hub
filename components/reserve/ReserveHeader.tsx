import Link from "next/link";

export function ReserveHeader({ active }: { active?: "guide" | "my" }) {
  return (
    <header className="header">
      <div className="header-left">
        <Link className="logo" href="/reserve">
          <span className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          BNI 대관 예약
        </Link>
        <nav className="header-nav">
          <Link href="/reserve" className={active === "guide" ? "nav-active" : ""}>
            공간 안내
          </Link>
          <span className="nav-separator">›</span>
          <Link href="/orders" className={active === "my" ? "nav-active" : ""}>
            나의 예약
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <svg className="help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    </header>
  );
}
