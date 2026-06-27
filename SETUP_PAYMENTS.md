# BNI Hub — 결제(토스페이먼츠) + Supabase 설정 가이드

정적 사이트를 **Next.js(App Router) + Supabase + 토스페이먼츠**로 재구축했습니다.
스토어 / 대관 예약 / 트레이닝 / 이북 **네 도메인 모두** 동일한
`주문 생성 → 결제위젯 → successUrl → 서버 승인(confirm) → 이행(예약/수강/열람권한)` 파이프라인을 씁니다.

## 1. 의존성 설치 / 실행
```bash
npm install
npm run dev      # http://localhost:3000
```

## 2. Supabase 준비
1. https://supabase.com 에서 프로젝트 생성
2. 대시보드 → **SQL Editor** 에 `supabase/schema.sql` 전체를 붙여넣고 실행
3. 대시보드 → Project Settings → **API** 에서 값 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 서버 전용, 절대 커밋/노출 금지)

## 3. 토스페이먼츠 키
`.env.local` 에 설정합니다. (`.env.local.example` 참고)

> ⚠️ **개발/테스트는 반드시 test 키**(`test_ck_`/`test_gck_`, `test_sk_`/`test_gsk_`)를 쓰세요.
> **live(실) 키는 실제 카드가 청구**됩니다. live 키는 배포 환경변수에만 넣습니다.

현재 `.env.local` 에는 토스 **결제위젯 공개 테스트 키**가 들어 있어 바로 결제 테스트가 가능합니다.
본인 키로 바꿀 때:
- 위젯 클라이언트 키 → `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- 시크릿 키 → `TOSS_SECRET_KEY`
- (위젯 연동은 client/secret 키가 **한 쌍**이어야 합니다.)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_...
TOSS_SECRET_KEY=test_gsk_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. 결제 테스트 흐름
1. `/store`(또는 `/ebook`, `/training`, `/reserve`)에서 상품/도서/과정/공간 선택
2. 체크아웃에서 주문자 정보 입력 → **주문 생성하기**
   - `/api/orders` 가 **서버에서 금액을 재계산**해 `orders/order_items/payments` 생성
3. 토스 결제위젯에서 결제수단 선택 → **결제하기**
4. 토스 결제 완료 → `/payments/success?paymentKey&orderId&amount` 로 복귀
5. `/api/payments/confirm` 가 **금액 검증 + 토스 승인 API 호출 + 도메인별 이행**
   - 대관 → `reservations`, 트레이닝 → `enrollments`, 이북 → `ebook_entitlements`

테스트 카드: 토스 테스트 결제창 안내에 따라 진행 (test 키 사용 시 실제 청구 없음).

## 5. 보안 설계 요점 (토스 권장 준수)
- **client 키는 프론트, secret 키는 서버 전용**으로 분리
- 결제 금액은 **클라이언트 입력을 신뢰하지 않고** 서버 카탈로그(`lib/catalog.ts`)로 재계산
- successUrl 복귀 후 **서버에서 paymentKey/orderId/amount 검증 → 승인 API 호출**
- 승인 멱등 처리(이미 paid면 재승인하지 않음), `payment_events` 감사 로그

## 6. 데이터 출처
- 상품/공간 카탈로그: 기존 `shared/data.js` 에서 이관 → `lib/data/_products.json`, `_spaces.json`
- 도서: 기존 `ebook/books.js` 이관 → `lib/data/_books.json`
- 트레이닝: 기존 데이터 + 가격/정원 신규 정의 → `lib/data/trainings.ts`
- 이미지: `store/img` → `public/store-img`, `ebook/images` → `public/ebook-img`

## 7. 다음 단계(프로덕션 전 권장)
- 카탈로그를 Supabase 테이블로 이전(현재는 서버 모듈이 가격 소스)
- 재고 차감/중복 주문 방지/쿠폰
- 토스 **웹훅** 수신(가상계좌 입금, 상태 보정)
- RLS 정책 추가(로그인 사용자가 본인 주문만 조회)
- 기존 정적 페이지(`store/`, `reserve/`, `training/`, `ebook/`, `admin/`)는 참고용 → `legacy/` 이동 또는 제거
