import "./news.css";
import Link from "next/link";
import { NewsBoard } from "./NewsBoard";

export const metadata = { title: "BNI 코리아 | News — 내셔널 오피스 공지사항" };

export default function NewsPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        rel="stylesheet"
      />
      <div className="news-page">
        {/* Header */}
        <header className="nav">
          <div className="wrap nav__in">
            <Link href="/" className="nav__logo">
              BNI
            </Link>
            <nav className="nav__menu">
              <Link href="/">Hub Home</Link>
              <Link href="/training">Training Home</Link>
              <Link href="/training/schedule">Schedule</Link>
              <Link href="/training/news" className="active">
                News
              </Link>
            </nav>
            <div className="nav__right">
              <Link href="/orders" className="nav__login">
                내 주문
              </Link>
              <Link href="/training" className="nav__cta">
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* Title */}
        <section className="wrap" style={{ padding: "48px 24px 8px" }}>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red">News</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">내셔널 오피스 공지사항</h1>
          <p className="mt-3 text-body">
            공지 확인부터 자유로운 소통까지 — 유저와 내셔널 오피스가 함께하는 게시판입니다.
          </p>
        </section>

        {/* Board */}
        <section className="wrap" style={{ padding: "20px 24px 70px" }}>
          <NewsBoard />
        </section>
      </div>
    </>
  );
}
