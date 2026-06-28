import Link from "next/link";

export function PagelyFooter() {
  return (
    <footer className="footer">
      <div className="pg-container">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ebook-img/logo_white.png" alt="Pagely" height={34} className="mb-3" style={{ height: 34 }} />
            <p className="text-sm">
              읽는 즐거움, 언제 어디서나.<br />30만 권의 전자책 플랫폼.
            </p>
            <div className="mt-3 flex gap-3">
              <a href="#" className="social-icon" aria-label="instagram"><i className="bi bi-instagram" /></a>
              <a href="#" className="social-icon" aria-label="facebook"><i className="bi bi-facebook" /></a>
              <a href="#" className="social-icon" aria-label="youtube"><i className="bi bi-youtube" /></a>
              <a href="#" className="social-icon" aria-label="x"><i className="bi bi-twitter-x" /></a>
            </div>
          </div>
          <div>
            <h6 className="footer-heading">고객센터</h6>
            <a href="#" className="footer-link">공지사항</a>
            <a href="#" className="footer-link">자주 묻는 질문</a>
            <a href="#" className="footer-link">1:1 문의</a>
          </div>
          <div>
            <h6 className="footer-heading">서비스</h6>
            <a href="#" className="footer-link">제휴카드</a>
            <a href="#" className="footer-link">뷰어 다운로드</a>
          </div>
          <div>
            <h6 className="footer-heading">기타 문의</h6>
            <a href="#" className="footer-link">원고 투고</a>
            <a href="#" className="footer-link">사업 제휴</a>
          </div>
          <div>
            <h6 className="footer-heading">회사</h6>
            <Link href="/" className="footer-link">BNI 허브 홈</Link>
            <a href="#" className="footer-link">인재 채용</a>
          </div>
        </div>
        <hr className="footer-hr" />
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            © 2026 Pagely. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="footer-link" style={{ margin: 0 }}>이용약관</a>
            <a href="#" className="footer-link" style={{ margin: 0 }}>개인정보처리방침</a>
            <a href="#" className="footer-link" style={{ margin: 0 }}>청소년보호정책</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
