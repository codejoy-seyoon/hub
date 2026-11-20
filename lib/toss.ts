/**
 * 결제 키 묶음(= 토스 MID). 주소마다 MID 가 다르다.
 *   store → store.bnikorea.com (굿즈, 국내결제)
 *   event      → event.bnikorea.com 국내결제 MID (카드·간편결제·계좌이체)
 *   event_intl → event.bnikorea.com 해외카드 MID
 * (토스 최종원 매니저 2026-11-20 16:47: 행사는 국내카드용 MID 와 해외카드용 MID 로 분리)
 * 행사용 키가 아직 없으면 앞 단계 키를 함께 쓴다(테스트 단계): 해외 → 행사 국내 → 스토어.
 */
export type TossScope = "store" | "event" | "event_intl";

export function tossScopeOf(
  domain: string | null | undefined,
  fulfillment?: Record<string, unknown> | null,
): TossScope {
  if (domain !== "event") return "store";
  const audience = (fulfillment?.event as { audience?: string } | undefined)?.audience;
  return audience === "international" ? "event_intl" : "event";
}

export function tossSecretKey(scope: TossScope = "store"): string {
  const store = process.env.TOSS_SECRET_KEY ?? "";
  const event = process.env.TOSS_EVENT_SECRET_KEY || store;
  if (scope === "event_intl") return process.env.TOSS_EVENT_INTL_SECRET_KEY || event;
  if (scope === "event") return event;
  return store;
}

/** 조회에 써 볼 시크릿 키 목록(중복 제거). 웹훅처럼 어느 MID 결제인지 모를 때 쓴다. */
export function tossSecretKeys(): string[] {
  return [...new Set([tossSecretKey("store"), tossSecretKey("event"), tossSecretKey("event_intl")])].filter(Boolean);
}

/**
 * 토스페이먼츠 결제 승인 — 반드시 서버에서만 호출.
 * successUrl 로 돌아온 paymentKey/orderId/amount 를 서버가 검증한 뒤
 * 이 함수로 승인(confirm) API를 호출한다.
 * secret 키는 절대 클라이언트로 노출하지 않는다.
 */
export async function confirmTossPayment(
  params: {
    paymentKey: string;
    orderId: string;
    amount: number;
  },
  scope: TossScope = "store",
) {
  const secretKey = tossSecretKey(scope);
  const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  const data = await res.json();

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

/**
 * 토스 결제 단건 조회 — paymentKey 로 권위있는 결제 상태를 가져온다.
 * (웹훅 수신 시 본문을 신뢰하지 않고 이 API로 상태를 재확인하는 용도)
 */
export async function getTossPayment(paymentKey: string, secretKey: string = tossSecretKey("store")) {
  const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${encodedKey}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * orderId(우리 toss_order_id)로 토스 결제 조회.
 * 웹훅 payload에 paymentKey가 없고 orderId만 있을 때 사용.
 */
export async function getTossPaymentByOrderId(orderId: string, secretKey: string = tossSecretKey("store")) {
  const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.tosspayments.com/v1/payments/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${encodedKey}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
