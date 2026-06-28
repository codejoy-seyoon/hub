import Link from "next/link";

/* legacy/index.html 다크 푸터 */
export function SiteFooter() {
  return (
    <footer
      className="border-t border-white/10 text-white/60"
      style={{ background: "#16181b" }}
    >
      <div className="wrap py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="mb-4 text-3xl font-black text-red">
              BNI<sup className="text-xs">®</sup> Korea
            </p>
            <p className="text-sm leading-relaxed">
              Changing the Way the World Does Business®
            </p>
            <Link className="btn btn-red mt-6 !px-7 !py-2.5" href="/#services">
              Join us
            </Link>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">서비스</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/store" className="hover:text-white">
                  Store
                </Link>
              </li>
              <li>
                <Link href="/training" className="hover:text-white">
                  Training
                </Link>
              </li>
              <li>
                <Link href="/ebook" className="hover:text-white">
                  eBook
                </Link>
              </li>
              <li>
                <Link href="/reserve" className="hover:text-white">
                  대관 예약
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">트레이닝</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/training" className="hover:text-white">
                  Training Home
                </Link>
              </li>
              <li>
                <Link href="/training/schedule" className="hover:text-white">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/training/news" className="hover:text-white">
                  News
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white">
                  내 주문
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-white">문의</p>
            <ul className="space-y-2.5 text-sm leading-relaxed">
              <li>
                Tel <span className="text-white">02-6261-8838</span>
              </li>
              <li>평일 10:00–18:00</li>
              <li>
                서울 성동구 뚝섬로1길 25<br />
                서울숲한라에코밸리 3층 301호
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/10 pt-8 text-xs md:flex-row">
          <p>
            (주)BNI 코리아 · 대표 윤형석 · 사업자등록번호 220-87-68060 ·
            통신판매업 신고
          </p>
          <div className="flex gap-5">
            <a className="hover:text-white">이용약관</a>
            <a className="hover:text-white">개인정보처리방침</a>
            <p>© 2026 BNI Korea</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
