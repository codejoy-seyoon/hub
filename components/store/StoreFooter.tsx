import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="lv-footer">
      <div className="lv-container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <h6 className="footer-title">고객지원</h6>
            <ul className="footer-list">
              <li><a href="#">문의하기</a></li>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">배송 안내</a></li>
              <li><a href="#">교환 / 반품</a></li>
            </ul>
          </div>
          <div>
            <h6 className="footer-title">서비스</h6>
            <ul className="footer-list">
              <li><a href="#">이메일 구독</a></li>
              <li><a href="#">단체 주문</a></li>
              <li><a href="#">챕터 굿즈</a></li>
              <li><a href="#">기프트</a></li>
            </ul>
          </div>
          <div>
            <h6 className="footer-title">BNI KOREA</h6>
            <ul className="footer-list">
              <li><Link href="/">허브 홈</Link></li>
              <li><Link href="/training">트레이닝</Link></li>
              <li><Link href="/ebook">eBook</Link></li>
              <li><a href="#">브랜드 소개</a></li>
            </ul>
          </div>
          <div>
            <h6 className="footer-title">팔로우</h6>
            <div className="footer-social">
              <a href="#" aria-label="instagram"><i className="bi bi-instagram" /></a>
              <a href="#" aria-label="facebook"><i className="bi bi-facebook" /></a>
              <a href="#" aria-label="youtube"><i className="bi bi-youtube" /></a>
              <a href="#" aria-label="link"><i className="bi bi-link-45deg" /></a>
            </div>
            <div className="footer-ship mt-4">
              <i className="bi bi-geo-alt" /> 배송 지역: 대한민국
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="mb-0">© 2026 BNI KOREA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
