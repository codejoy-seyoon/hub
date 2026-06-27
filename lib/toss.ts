/**
 * 토스페이먼츠 결제 승인 — 반드시 서버에서만 호출.
 * successUrl 로 돌아온 paymentKey/orderId/amount 를 서버가 검증한 뒤
 * 이 함수로 승인(confirm) API를 호출한다.
 * secret 키는 절대 클라이언트로 노출하지 않는다.
 */
export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const secretKey = process.env.TOSS_SECRET_KEY!;
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
export async function getTossPayment(paymentKey: string) {
  const secretKey = process.env.TOSS_SECRET_KEY!;
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
export async function getTossPaymentByOrderId(orderId: string) {
  const secretKey = process.env.TOSS_SECRET_KEY!;
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
