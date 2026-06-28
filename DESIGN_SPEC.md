# BNI Korea Hub — 디자인 명세 (Legacy → Next.js 정밀 이식)

> 목적: `legacy/` 정적 사이트의 디자인을 **컴포넌트 단위로 정확히** Next.js(App Router + Tailwind v4)에 재현한다.
> 원칙: "대충 비슷하게" 금지. 모든 px·간격·타이포·hover·브레이크포인트를 아래 스펙대로 옮긴다.
> 출처(SoT): `legacy/index.html`, `legacy/training/index.html`, `legacy/shared/brand.css` 및 각 페이지 CSS.

---

## 1. 디자인 토큰 (Design Tokens)

### 1.1 컬러
| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-bni-red` | `#e11b2b` | 기본 레드 (강조 텍스트, 아이콘) |
| `--color-bni-red-strong` | `#cf2030` | 헤더/히어로 그라데이션 시작 |
| `--color-bni-red-dark` | `#9a0d1a` | 그라데이션 끝, 진한 강조 |
| `--color-bni-red-soft` | `#fdebed` | 옅은 레드 배경 틴트 (뱃지/아이콘칩) |
| `--color-bni-ink` | `#222428` | 제목/진한 텍스트, 다크 섹션 배경 |
| `--color-bni-body` | `#5b6168` | 본문 텍스트 |
| `--color-bni-soft` | `#eef0f2` | 밝은 섹션 배경 (Stats) |
| `--color-bni-line` | `#e7e8ea` | 헤어라인/보더 |
| `--bni-nav-light` | `#f2f2f2` | 헤더 네비 pill 배경 |
| 다크 푸터 배경 | `#16181b` | 푸터 전용 |
| 3-Steps 배경 | `bni-ink (#222428)` | "3단계로 시작하세요" 섹션 |

### 1.2 그라데이션 / 셰도우
- **레드 그라데이션(주):** `linear-gradient(90deg, #cf2030 63.67%, #9a0d1a 100%)` — 헤더 CTA, 히어로 버튼
- **레드 그라데이션(버튼 .btn-red):** `linear-gradient(180deg, #e8222f, #cf1320)`
- **카드 셰도우:** `0 8px 30px rgba(20,20,30,.08)`
- **헤더 셰도우:** `0 4px 16px rgba(0,0,0,.16)`
- **CTA 셰도우:** `0 6px 14px rgba(207,32,48,.18~.22)`

### 1.3 타이포그래피
- **폰트:** Pretendard (Variable, weight 45–920), fallback `system-ui, -apple-system, "Segoe UI", "Malgun Gothic", sans-serif`
- **본문 색:** `#222428`, `-webkit-font-smoothing: antialiased`
- **헤딩 스케일(Tailwind):** 섹션 제목 `text-3xl md:text-4xl font-extrabold`, 대형 `md:text-[40px]`, 통계 숫자 `text-4xl lg:text-5xl font-extrabold`
- **아이콘 폰트:** Material Symbols Outlined (24, 400)

### 1.4 형태(Radius) / 컨테이너
- `--bni-radius: 1.25rem` (카드 기본), 추가 `xl:0.9rem`, `2xl:1.25rem`, `3xl:1.75rem`
- **콘텐츠 컨테이너 `.wrap`:** `max-width:1200px; margin:0 auto; padding:0 24px`
- **헤더/히어로 컨테이너:** `width:min(1310px, calc(100% - 48px)); margin:0 auto` (wrap보다 넓음)

### 1.5 반응형 브레이크포인트
| 브레이크 | 규칙 |
|---|---|
| `≤1024px` (태블릿) | 네비 메뉴/이메일 숨김 → 햄버거 노출, nav가 콘텐츠 폭으로 축소, 우측 정렬 |
| `≤640px` (모바일) | 헤더 패딩 12px, 로고 38px, nav 높이 50px, CTA 축소(36px). 히어로 notch 제거 → radius 18px, 헤드라인 축소, CTA 버튼 풀폭 하단 배치 |

---

## 2. 글로벌 컴포넌트

### 2.1 Header `<SiteHeader>` — 흰 바 + 회색 pill 네비
- 컨테이너: `position:sticky; top:0; z-index:999; background:#fff; box-shadow:0 4px 16px rgba(0,0,0,.16); padding:18px 0`
- inner: `width:min(1310px, calc(100% - 48px)); display:flex; align-items:center; gap:18px`
- **로고:** 텍스트 "BNI", `color:#cf2030; font-size:54px; font-weight:800; letter-spacing:-.03em; width:124px`
- **네비 pill:** `flex:1; height:65px; background:#f2f2f2; border-radius:80px; padding:0 20px; flex; justify-between`
  - 좌측 spacer(`flex:1`) → 메뉴 중앙 정렬 / 우측 그룹(`flex:1`, 우측정렬)
  - 메뉴 항목 gap: `28px`, `font-size:14px; font-weight:400; color:#111`, hover `color:#cf2030`
  - 메뉴(홈 기준): Home / Store / Training / Schedule / News / 대관 예약
  - 우측: `Login`(텍스트 링크) + CTA 버튼 "서비스 바로가기"
  - **CTA:** `width:175px; height:42px; border-radius:999px; gradient(90deg #cf2030→#9a0d1a); color:#fff; font-size:15px; font-weight:700; shadow 0 6px 14px rgba(207,32,48,.18)`
- **햄버거:** 기본 숨김, `≤1024px`에서 노출. 막대 3개 `width:22px; height:2px; gap:5px; #1a1a1a`

### 2.2 Hero `<Hero>` — 라운드 비디오 카드 + notch + 워드 로테이터 + 오버랩 CTA
- 섹션 `padding-top:28px`, inner `width:min(1310px, calc(100% - 48px)); position:relative`
- **미디어:** `aspect-ratio:1500/718`, 자동재생 muted loop 비디오(poster 이미지 fallback)
  - **notch 마스크:** 우하단 둥근 노치가 파인 SVG mask (CTA 버튼 자리). `mask-size:100% 100%` (SVG path는 스펙 그대로 복사)
- **헤드라인:** `position:absolute; left:34px; bottom:22px; color:#fff; font-size:clamp(32px,5.5vw,75px); font-weight:800; line-height:.95; letter-spacing:-.04em; text-shadow:0 2px 8px rgba(0,0,0,.18)`
  - eyebrow: `font-size:.30em; font-weight:700; opacity:.92` — "BNI Korea National Office Presents"
  - 본문: "BNI : THE REAL " + **워드 로테이터** (MBA→NETWORK→REFERRAL→GROWTH→MBA)
  - **로테이터 애니메이션:** `rotWords 9s infinite cubic-bezier(.86,0,.07,1)`, 5단계 `translateY` (-4em→0), `prefers-reduced-motion`시 정지
- **CTA 버튼(오버랩):** `position:absolute; right:0; bottom:0; width:26.9%; aspect-ratio:352/72; border-radius:16px 16px 24px 16px; gradient; font-size:clamp(11px,1.15vw,15px); font-weight:800` — "JOIN US"
- **모바일(≤640):** notch 제거(radius 18px), CTA `position:static; width:100%; height:36px; radius:999px` 하단 흐름

### 2.3 Button — `.btn` 시스템
- 기본 `.btn`: `inline-flex; gap:8px; border-radius:9999px; font-weight:700; font-size:14px; letter-spacing:.05em; padding:14px 30px; text-transform:uppercase; transition:.2s`
- `.btn-red`: `gradient(180deg #e8222f→#cf1320); color:#fff; shadow 0 4px 10px rgba(0,0,0,.14)`; hover `brightness(1.07)`
- `.btn-line`: `bg #fff; color #222428; border:2px solid #222428`; hover 반전(`bg #222428; color #fff`)

### 2.4 Card — `.card`
- `background:#fff; border-radius:1.25rem; box-shadow:0 8px 30px rgba(20,20,30,.08)`
- 서비스 카드 hover: `hover:-translate-y-1 transition`
- 이미지 카드(프로그램): 상단 이미지 `aspect-ratio:4/3; object-fit:cover`, 본문 `p-6`, 카테고리 뱃지 `bg-red-soft text-red text-xs font-bold px-3 py-1 rounded-full`

### 2.5 Footer `<SiteFooter>` — 다크
- `background:#16181b; color:rgba(255,255,255,.6); border-top:1px solid rgba(255,255,255,.1)`
- inner `.wrap py-16`, 4컬럼 그리드(`grid-cols-2 md:grid-cols-4 gap-10`)
  - 1열: 로고 "BNI® Korea"(`text-3xl font-black text-red`), 슬로건, Join us 버튼
  - 2열 서비스 / 3열 트레이닝 / 4열 문의(연락처)
  - 하단 바: 사업자 정보 + 약관/방침 + © (border-top, `text-xs`)
- 링크 hover: `hover:text-white`

### 2.6 ChatFab — 우하단 고정 챗 버튼
- `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red text-white grid place-items-center shadow-xl hover:bg-red-dark z-50`, 아이콘 `chat_bubble`

### 2.7 SectionHeading — 섹션 공통 헤더(중앙)
- `text-center max-w-2xl mx-auto mb-14`
- eyebrow: `text-red font-bold tracking-widest uppercase text-sm mb-3`
- 제목: `text-3xl md:text-4xl font-extrabold`
- 서브: `text-body text-lg mt-4`

---

## 3. 홈 페이지 섹션 순서 (`legacy/index.html`)
1. **Header** (2.1)
2. **Hero** (2.2)
3. **Services** — `.wrap py-20`, SectionHeading("Services") + 4카드 그리드(`sm:grid-cols-2 lg:grid-cols-4 gap-8`). 카드: 아이콘칩(`w-14 h-14 rounded-2xl bg-red-soft`) + 제목 + 설명 + "바로가기 →". Store/Training/eBook/대관예약
4. **Intro** — `.wrap pb-16`, 2컬럼(`md:grid-cols-2 gap-10 md:gap-16`): 좌 제목("Changing the Way / the World Does Business"), 우 본문 + 영상 썸네일(play overlay, group-hover scale)
5. **Stats** — `bg-soft`, `.wrap py-16`, 5개 통계(`grid-cols-2 md:grid-cols-5`), 숫자 `text-4xl lg:text-5xl font-extrabold text-red`. 하단 "Schedule 보기" 버튼
6. **Programs** — `.wrap py-20`, SectionHeading("Programs") + 4개 이미지 카드. 데이터: MSP/파워팀/맞춤영업팀/라이프스타일
7. **3 Steps** — `bg-ink text-white`, `.wrap py-20 text-center`, 3카드(`bg-white/5 border border-white/10`), 번호 `text-5xl font-black text-red`
8. **Footer** (2.5)
9. **ChatFab** (2.6)

---

## 4. 페이지별 (2차 이식 — 각 구현 시 해당 CSS 정밀 추출)
| 페이지 | legacy 출처 | 비고 |
|---|---|---|
| Store 목록/상세 | `legacy/store/` (`style.css` 636L, `brand-override.css`) | 상품 그리드·상세·장바구니 UI |
| Training 홈/Schedule/News/Code | `legacy/training/*.html` | 홈은 글로벌 컴포넌트 재사용 |
| eBook 목록/상세/뷰어/로그인 | `legacy/ebook/` (`style.css` 1086L) | 가장 큰 페이지 스타일 |
| 대관 예약 | `legacy/reserve/` (`styles.css` 978L, `app.js`) | 날짜·시간 슬롯 선택 UI |
| Admin | `legacy/admin/index.html` | 관리자 |

> ⚠️ 결제/Supabase 연동(`app/api/*`, `lib/orderStore.ts`, `CheckoutPanel`)은 **그대로 유지**하고, 위 디자인 셸만 교체한다. 각 페이지의 구매/예약 버튼 → 기존 결제 흐름에 그대로 연결.

---

## 5. 이식 전략 (구현 순서)
- **Phase 1 (디자인 기반 + 홈):** 토큰/유틸 → 글로벌 컴포넌트(Header, Hero, Footer, ChatFab, Button, Card, SectionHeading) → 홈 7섹션. → legacy와 스크린샷 대조 검수.
- **Phase 2 (내부 페이지):** Store → Training/Schedule/News → Reserve → eBook → Admin 순. 각 페이지 CSS 정밀 추출 후 이식, 결제 흐름 연결 유지.
- 각 Phase 종료 시 1280px / 768px / 375px 3개 뷰포트에서 legacy 대비 시각 검수.
