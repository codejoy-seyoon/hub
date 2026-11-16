import styles from "./WelcomePackDetail.module.css";

const asset = (name: string) => `/store-web/welcome-pack/${name}`;

const details = [
  { image: "interior_red.jpg", title: "한눈에 알아보는 BNI 레드", text: "가방에서 꺼내는 순간부터 미팅 테이블 위까지. 선명한 레드 컬러가 BNI의 첫인상을 이어 줍니다." },
  { image: "interior_strap.jpg", title: "가볍게 들고, 편하게 이동", text: "탈부착 손목 스트랩으로 이동할 때도 간편하게. 스트랩에 담긴 Givers Gain®의 의미를 일상에서 함께합니다." },
  { image: "interior_storage.jpg", title: "작은 도구까지 제자리에", text: "메쉬 포켓과 수납 포켓, 펜 홀더로 명함과 필기 도구를 정리하세요. 필요한 순간에 바로 꺼내 쓸 수 있습니다." },
  { image: "interior_qr.jpg", title: "만남을 온라인 연결로", text: "QR 멀티 키 참을 통해 BNI 코리아의 온라인 시스템으로 이동하세요. 미팅에서 시작한 연결을 계속 이어 갑니다." },
];

export function WelcomePackDetail({ productId, productName }: { productId: string; productName: string }) {
  const isSet = productId === "pouch-mug-set";
  if (!isSet && productId !== "welcome-pouch") return null;

  return (
    <article className={styles.detail} aria-labelledby="welcome-detail-title">
      <nav className={styles.navigation} aria-label="웰컴팩 상세 안내">
        <a href="#welcome-detail-title">상품 이야기</a>
        <a href="#welcome-storage">수납과 구성</a>
        <a href="#welcome-details">제품 디테일</a>
        <a href="#welcome-everyday">사용하는 순간</a>
      </nav>

      <header className={styles.intro}>
        <p className={styles.eyebrow}>BNI 프로페셔널 오거나이저</p>
        <h2 id="welcome-detail-title">더 잘 준비된 만남의 시작.</h2>
        <p className={styles.lead}>명함과 자료, 메모를 위한 도구까지 한곳에.<br />미팅을 준비하는 시간을 줄이고, 눈앞의 대화에 더 집중하세요.</p>
        <img src={asset("pouch_front.jpg")} alt="붉은 BNI 프로페셔널 오거나이저의 앞면과 지퍼" width={1400} height={933} loading="lazy" />
        <div className={styles.included}>
          <span>선택하신 상품</span>
          <strong>{productName}</strong>
          <p>{isSet ? "머그와 레드 파우치가 함께하는 세트입니다." : "레드 파우치 단품입니다."} 상세 사진에 등장하는 도서·명찰·필기 도구는 활용 예시입니다.</p>
        </div>
      </header>

      <section className={styles.storage} id="welcome-storage" aria-labelledby="welcome-storage-title">
        <div className={styles.sectionCopy}>
          <p className={styles.eyebrow}>준비부터 정리까지</p>
          <h2 id="welcome-storage-title">열면 바로,<br />오늘의 미팅 준비 끝.</h2>
          <p>주간 미팅에서도, 깊이 있는 1-2-1에서도.<br />필요한 도구가 제자리에 있으면 대화의 흐름을 놓치지 않습니다.</p>
          <ol className={styles.storageList}>
            <li><span>01</span><div><h3>자료는 가지런히</h3><p>가이드와 리퍼럴 자료를 포켓에 나누어 정리합니다.</p></div></li>
            <li><span>02</span><div><h3>작은 물건도 한눈에</h3><p>메쉬 포켓에 명함과 작은 소지품을 모아 둡니다.</p></div></li>
            <li><span>03</span><div><h3>기록할 준비까지</h3><p>펜 홀더에 필기 도구를 두고, 중요한 이야기를 바로 남깁니다.</p></div></li>
          </ol>
        </div>
        <figure><img src={asset("pouch_inside1.jpg")} alt="BNI 오거나이저의 내부 포켓과 펜 홀더, 수납 활용 예시" width={1400} height={933} loading="lazy" /><figcaption>내부 구성과 수납 예시</figcaption></figure>
      </section>

      <section id="welcome-details" aria-labelledby="welcome-details-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>매일 손이 가는 이유</p><h2 id="welcome-details-title">작은 디테일이 만드는 차이.</h2></div>
        <div className={styles.features}>{details.map((detail) => <section className={styles.feature} key={detail.image}>
          <img src={asset(detail.image)} alt={detail.title} width={900} height={600} loading="lazy" />
          <h3>{detail.title}</h3><p>{detail.text}</p>
        </section>)}</div>
      </section>

      <section className={styles.everyday} id="welcome-everyday" aria-labelledby="welcome-everyday-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>만남에서 일상으로</p><h2 id="welcome-everyday-title">미팅이 있는 날,<br />늘 함께하는 레드 파우치.</h2><p>이동할 때는 가볍게 들고, 자리에 앉으면 필요한 도구를 펼쳐 보세요.<br />하나의 오거나이저가 준비와 만남, 그다음 실행을 이어 줍니다.</p></div>
        <div className={styles.lifestyle}><figure><img src={asset("lifestyle_7.png")} alt="레드 오거나이저와 함께 미팅을 준비하는 BNI 멤버의 사용 연출" width={1024} height={775} loading="lazy" /><figcaption>만남을 준비하는 순간</figcaption></figure><figure><img src={asset("lifestyle_desk.png")} alt="업무 공간에서 레드 오거나이저를 정리하는 멤버의 사용 연출" width={1024} height={775} loading="lazy" /><figcaption>오늘의 이야기를 정리하는 순간</figcaption></figure></div>
      </section>

      <aside className={styles.guide}>
        <div><p className={styles.eyebrow}>처음 시작하는 멤버라면</p><h2>웰컴팩을 더 잘 활용하는 방법.</h2><p>BNI 온보딩 사이트에서 키트 소개와 멤버 활동에 필요한 리소스를 확인하세요.</p></div>
        <a href="https://welcome-bnikorea.com/welcome_kit" target="_blank" rel="noopener noreferrer">웰컴팩 활용 안내 <span aria-hidden="true">↗</span></a>
        <p className={styles.guideNote}>온보딩 사이트의 신규 런칭 챕터용 키트 안내와 스토어 판매 상품의 구성은 다릅니다. 주문하실 상품은 이 페이지 상단의 상품명과 구성 안내를 확인해 주세요.</p>
      </aside>
    </article>
  );
}
