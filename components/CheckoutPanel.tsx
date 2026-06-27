"use client";

import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { Customer, OrderRequest } from "@/lib/catalog";

type PreparedOrder = {
  orderId: string;
  internalOrderId: string;
  domain: string;
  orderName: string;
  amount: number;
  customerKey: string;
  customer: Customer;
};

type PaymentInstance = ReturnType<
  Awaited<ReturnType<typeof loadTossPayments>>["payment"]
>;

type PayMethod = "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT";
const METHODS: { key: PayMethod; label: string }[] = [
  { key: "CARD", label: "신용/체크카드" },
  { key: "TRANSFER", label: "계좌이체" },
  { key: "VIRTUAL_ACCOUNT", label: "가상계좌" },
];

type Props = {
  makeRequest: (customer: Customer) => OrderRequest;
  amount: number;
  summary?: React.ReactNode;
  disabledReason?: string;
  defaultCustomer?: Partial<Customer>;
};

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";

export function CheckoutPanel({
  makeRequest,
  amount,
  summary,
  disabledReason,
  defaultCustomer,
}: Props) {
  const [customer, setCustomer] = useState<Customer>({
    name: defaultCustomer?.name ?? "",
    email: defaultCustomer?.email ?? "",
    phone: defaultCustomer?.phone ?? "",
  });
  const [prepared, setPrepared] = useState<PreparedOrder | null>(null);
  const [payment, setPayment] = useState<PaymentInstance | null>(null);
  const [method, setMethod] = useState<PayMethod>("CARD");
  const [ready, setReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function prepareOrder() {
    setError(null);
    if (!customer.name || !customer.email || !customer.phone) {
      setError("이름·이메일·전화번호를 모두 입력하세요.");
      return;
    }
    setPreparing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(makeRequest(customer)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "주문 생성에 실패했습니다.");
      setPrepared(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "주문 생성 중 오류가 발생했습니다.");
    } finally {
      setPreparing(false);
    }
  }

  useEffect(() => {
    if (!prepared) return;
    let cancelled = false;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        if (cancelled) return;
        // 결제창(일반 결제) — API 개별 연동 키(live_ck/live_sk) 지원
        setPayment(tossPayments.payment({ customerKey: prepared.customerKey }));
        setReady(true);
      } catch (e: unknown) {
        console.error("[toss]", e);
        const err = e as { code?: string; message?: string };
        const detail = [err?.code, err?.message].filter(Boolean).join(" · ") || String(e);
        setError(`결제 모듈 로드 실패: ${detail}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prepared]);

  async function requestPayment() {
    if (!payment || !prepared) return;
    setError(null);
    setPaying(true);

    const base = SITE || window.location.origin;
    const common = {
      amount: { currency: "KRW", value: prepared.amount },
      orderId: prepared.orderId,
      orderName: prepared.orderName,
      successUrl: `${base}/payments/success`,
      failUrl: `${base}/payments/fail`,
      customerEmail: prepared.customer.email,
      customerName: prepared.customer.name,
      customerMobilePhone: prepared.customer.phone.replace(/\D/g, ""),
    };

    try {
      if (method === "CARD") {
        await payment.requestPayment({
          ...common,
          method: "CARD",
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      } else if (method === "TRANSFER") {
        await payment.requestPayment({
          ...common,
          method: "TRANSFER",
          transfer: { cashReceipt: { type: "소득공제" }, useEscrow: false },
        });
      } else {
        await payment.requestPayment({
          ...common,
          method: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            cashReceipt: { type: "소득공제" },
            useEscrow: false,
            validHours: 24,
          },
        });
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      // 사용자가 결제창을 닫은 경우는 에러로 표시하지 않음
      if (err?.code !== "USER_CANCEL") {
        setError(`결제 요청 실패: ${[err?.code, err?.message].filter(Boolean).join(" · ") || String(e)}`);
      }
      setPaying(false);
    }
  }

  const won = (n: number) => "₩" + n.toLocaleString("ko-KR");

  return (
    <div className="space-y-6">
      {summary}

      <section className="rounded-2xl border border-bni-line p-5">
        <h2 className="mb-4 text-lg font-bold">주문자 정보</h2>
        <div className="grid gap-3">
          <input
            value={customer.name}
            onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
            placeholder="이름"
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
          <input
            value={customer.email}
            onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
            placeholder="이메일"
            type="email"
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
          <input
            value={customer.phone}
            onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
            placeholder="휴대폰 번호 (- 없이)"
            inputMode="numeric"
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
        </div>

        {!prepared ? (
          <button
            type="button"
            onClick={prepareOrder}
            disabled={preparing || !!disabledReason}
            className="mt-4 w-full rounded-xl bg-bni-red py-3.5 font-bold text-white transition hover:bg-bni-red-strong disabled:opacity-50"
          >
            {disabledReason
              ? disabledReason
              : preparing
                ? "주문 생성 중..."
                : `${won(amount)} 주문 생성하기`}
          </button>
        ) : (
          <p className="mt-4 rounded-xl bg-bni-red-soft px-4 py-3 text-sm text-bni-red-dark">
            주문이 생성되었습니다. 결제수단을 선택해 결제를 진행하세요.
            <br />
            주문번호: {prepared.orderId}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
      </section>

      {prepared && (
        <section className="rounded-2xl border border-bni-line p-5">
          <h2 className="mb-4 text-lg font-bold">결제수단</h2>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={`rounded-xl border py-3 text-sm font-semibold transition ${
                  method === m.key
                    ? "border-bni-red bg-bni-red text-white"
                    : "border-bni-line hover:border-bni-red"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={requestPayment}
            disabled={!ready || paying}
            className="mt-5 w-full rounded-xl bg-bni-ink py-4 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {paying ? "결제창 이동 중..." : `${won(prepared.amount)} 결제하기`}
          </button>
        </section>
      )}
    </div>
  );
}
