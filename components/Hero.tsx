/* legacy/index.html 히어로: 라운드 비디오 카드 + 우하단 notch + 워드 로테이터 + 오버랩 CTA */
export function Hero() {
  return (
    <section className="bni-hero">
      <div className="bni-hero__inner">
        <div className="bni-hero__media">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&h=900&q=80"
          >
            <source
              src="https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
            <source
              src="https://videos.pexels.com/video-files/3252919/3252919-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="bni-hero__headline">
            <span className="bni-hero__eyebrow">
              BNI Korea National Office Presents
            </span>
            BNI : THE REAL{" "}
            <span className="rot">
              <span className="rot__in">
                <span>MBA</span>
                <span>NETWORK</span>
                <span>REFERRAL</span>
                <span>GROWTH</span>
                <span>MBA</span>
              </span>
            </span>
          </div>
        </div>
        <a href="#services" className="bni-hero__cta-btn">
          JOIN US
        </a>
      </div>
    </section>
  );
}
