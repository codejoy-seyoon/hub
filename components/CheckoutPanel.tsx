"use client";

import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { Customer, OrderRequest, Shipping } from "@/lib/catalog";
import { REGIONS, REGION_NONE, CHAPTER_OTHER, chaptersOf } from "@/lib/data/regions";
import { money } from "@/lib/format";

type PreparedOrder = {
  orderId: string;
  internalOrderId: string;
  domain: string;
  orderName: string;
  amount: number;
  currency?: "KRW" | "USD";
  customerKey: string;
  customer: Customer;
};

type PaymentInstance = ReturnType<
  Awaited<ReturnType<typeof loadTossPayments>>["payment"]
>;

type PayMethod = "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT" | "INTL_CARD";
const METHODS: { key: PayMethod; label: string }[] = [
  { key: "CARD", label: "신용/체크카드" },
  { key: "TRANSFER", label: "계좌이체" },
  { key: "VIRTUAL_ACCOUNT", label: "가상계좌" },
];
// 행사 티켓: 국내 결제수단에 더해 해외 발급 카드(Visa·Mastercard 등)를 받는다.
const INTL_METHOD: { key: PayMethod; label: string } = {
  key: "INTL_CARD",
  label: "International Card (Visa · Mastercard · JCB · AMEX)",
};

type Props = {
  makeRequest: (customer: Customer, shipping?: Shipping) => OrderRequest;
  /** 실물 배송 주문(스토어)일 때 배송지와 지역·챕터를 함께 받는다. */
  withShipping?: boolean;
  amount: number;
  summary?: React.ReactNode;
  disabledReason?: string;
  defaultCustomer?: Partial<Customer>;
  /** 행사 티켓 주문. 국내용이면 국내 결제수단, 국외용이면 해외카드 결제창(영문 화면)만 보여 준다. */
  eventAudience?: "domestic" | "international";
  /** 이 주문에 쓸 토스 클라이언트 키(MID 가 다른 주소용). 없으면 스토어 키. */
  tossClientKey?: string;
  /** 화면에 보여 줄 금액의 통화. 없으면 원화. 실제 결제 통화는 서버가 만든 주문의 통화를 따른다. */
  currency?: "KRW" | "USD";
};

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";
// 테스트 키로 연결된 동안에는 화면에 테스트 안내를 띄운다.
// (실제 판정은 컴포넌트 안에서 이 주문에 쓰는 키로 한다.)

export function CheckoutPanel({
  makeRequest,
  amount,
  summary,
  disabledReason,
  defaultCustomer,
  withShipping = false,
  eventAudience,
  tossClientKey,
  currency = "KRW",
}: Props) {
  const clientKey = tossClientKey || TOSS_CLIENT_KEY;
  const IS_TEST_MODE = (clientKey ?? "").startsWith("test_");
  const eventMode = !!eventAudience;
  const intl = eventAudience === "international";
  // 국외용 화면은 영문, 그 밖은 국문
  const t = (ko: string, en: string) => (intl ? en : ko);
  const methods = intl ? [INTL_METHOD] : METHODS;
  const [customer, setCustomer] = useState<Customer>({
    name: defaultCustomer?.name ?? "",
    email: defaultCustomer?.email ?? "",
    phone: defaultCustomer?.phone ?? "",
  });
  const [shipping, setShipping] = useState<Shipping>({
    postcode: "",
    address1: "",
    address2: "",
    region: "",
    chapter: "",
  });
  const [prepared, setPrepared] = useState<PreparedOrder | null>(null);
  const [payment, setPayment] = useState<PaymentInstance | null>(null);
  const [method, setMethod] = useState<PayMethod>(intl ? "INTL_CARD" : "CARD");
  const [ready, setReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결제 키가 연결되지 않은 배포에서는 주문을 받지 않는다.
  const blockedReason =
    disabledReason ?? (clientKey ? undefined : "결제 준비 중입니다");

  async function prepareOrder() {
    if (blockedReason) return;
    setError(null);
    if (!customer.name || !customer.email || !customer.phone) {
      setError(t("이름·이메일·전화번호를 모두 입력하세요.", "Please enter your name, email and phone number."));
      return;
    }
    if (withShipping) {
      if (!/^\d{5}$/.test(shipping.postcode) || shipping.address1.trim().length < 2) {
        setError("배송지 우편번호(5자리)와 주소를 입력하세요.");
        return;
      }
      if (!shipping.region || !shipping.chapter) {
        setError("지역과 챕터를 선택하세요.");
        return;
      }
    }
    setPreparing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(makeRequest(customer, withShipping ? shipping : undefined)),
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
        const tossPayments = await loadTossPayments(clientKey);
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
  }, [prepared, clientKey]);

  async function requestPayment() {
    if (!payment || !prepared) return;
    setError(null);
    setPaying(true);

    const base = SITE || window.location.origin;
    const common = {
      amount: { currency: prepared.currency ?? "KRW", value: prepared.amount },
      orderId: prepared.orderId,
      orderName: prepared.orderName,
      successUrl: `${base}/payments/success`,
      failUrl: `${base}/payments/fail`,
      customerEmail: prepared.customer.email,
      customerName: prepared.customer.name,
      customerMobilePhone: prepared.customer.phone.replace(/\D/g, ""),
    };

    try {
      if (method === "INTL_CARD") {
        // 해외 발급 카드: 다국어 결제창이 열린다. 금액은 원화 그대로 청구된다.
        // 해외 전화번호는 형식이 달라 토스에 넘기지 않는다.
        const { customerMobilePhone: _omit, ...intlCommon } = common;
        void _omit;
        await payment.requestPayment({
          ...intlCommon,
          method: "CARD",
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
            useInternationalCardOnly: true,
          },
        });
      } else if (method === "CARD") {
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

  const won = (n: number) => money(n, prepared?.currency ?? currency);

  // 우편번호 찾기(카카오 우편번호 서비스). 창이 안 열리면 직접 입력해도 된다.
  function openPostcode() {
    type DaumWindow = Window & {
      daum?: { Postcode: new (o: { oncomplete: (d: { zonecode: string; roadAddress: string; jibunAddress: string }) => void }) => { open: () => void } };
    };
    const w = window as DaumWindow;
    const open = () =>
      new w.daum!.Postcode({
        oncomplete: (d) =>
          setShipping((p) => ({ ...p, postcode: d.zonecode, address1: d.roadAddress || d.jibunAddress })),
      }).open();
    if (w.daum?.Postcode) return open();
    const script = document.createElement("script");
    // 2026-11-30에 t1.daumcdn.net 주소가 종료돼 카카오 새 주소를 쓴다.
    script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = open;
    script.onerror = () => setError("주소 찾기를 불러오지 못했습니다. 우편번호와 주소를 직접 입력해 주세요.");
    document.head.appendChild(script);
  }

  const field =
    "h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft";
  const chapterOptions = chaptersOf(shipping.region);

  return (
    <div className="space-y-6">
      {IS_TEST_MODE && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {eventMode
            ? t("테스트 결제 모드입니다. 실제로 결제되지 않습니다.", "Test mode — no real charge will be made.")
            : "테스트 결제 모드입니다. 실제로 결제되거나 배송되지 않습니다."}
        </p>
      )}
      {summary}

      <section className="rounded-2xl border border-bni-line p-5">
        <h2 className="mb-4 text-lg font-bold">{t("주문자 정보", "Buyer information")}</h2>
        <div className="grid gap-3">
          <input
            value={customer.name}
            onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
            placeholder={t("이름", "Full name")}
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
          <input
            value={customer.email}
            onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
            placeholder={t("이메일", "Email")}
            type="email"
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
          <input
            value={customer.phone}
            onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
            placeholder={t("휴대폰 번호 (- 없이)", "Phone number (digits only, with country code)")}
            inputMode="numeric"
            disabled={!!prepared}
            className="h-12 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red disabled:bg-bni-soft"
          />
        </div>

        {withShipping && (
          <>
            <h3 className="mb-3 mt-6 text-base font-bold">배송지</h3>
            <div className="grid gap-3">
              <div className="flex gap-2">
                <input
                  value={shipping.postcode}
                  onChange={(e) => setShipping((p) => ({ ...p, postcode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                  placeholder="우편번호"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  disabled={!!prepared}
                  className={`${field} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={openPostcode}
                  disabled={!!prepared}
                  className="h-12 flex-none rounded-xl border border-bni-ink px-4 text-sm font-semibold disabled:opacity-50"
                >
                  주소 찾기
                </button>
              </div>
              <input
                value={shipping.address1}
                onChange={(e) => setShipping((p) => ({ ...p, address1: e.target.value }))}
                placeholder="주소"
                autoComplete="address-line1"
                disabled={!!prepared}
                className={field}
              />
              <input
                value={shipping.address2}
                onChange={(e) => setShipping((p) => ({ ...p, address2: e.target.value }))}
                placeholder="상세 주소 (동·호수 등)"
                autoComplete="address-line2"
                disabled={!!prepared}
                className={field}
              />
            </div>

            <h3 className="mb-3 mt-6 text-base font-bold">소속</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={shipping.region}
                onChange={(e) => {
                  const region = e.target.value;
                  setShipping((p) => ({ ...p, region, chapter: region === REGION_NONE ? REGION_NONE : "" }));
                }}
                aria-label="지역"
                disabled={!!prepared}
                className={`${field} bg-white`}
              >
                <option value="">지역 선택</option>
                {REGIONS.map((entry) => (
                  <option key={entry.region} value={entry.region}>{entry.region}</option>
                ))}
                <option value={REGION_NONE}>{REGION_NONE} (멤버 아님)</option>
              </select>
              <select
                value={shipping.chapter}
                onChange={(e) => setShipping((p) => ({ ...p, chapter: e.target.value }))}
                aria-label="챕터"
                disabled={!!prepared || !shipping.region || shipping.region === REGION_NONE}
                className={`${field} bg-white`}
              >
                {shipping.region === REGION_NONE ? (
                  <option value={REGION_NONE}>{REGION_NONE}</option>
                ) : (
                  <>
                    <option value="">{shipping.region ? "챕터 선택" : "지역을 먼저 선택"}</option>
                    {chapterOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    {shipping.region && <option value={CHAPTER_OTHER}>{CHAPTER_OTHER}</option>}
                  </>
                )}
              </select>
            </div>
          </>
        )}

        {!prepared ? (
          <button
            type="button"
            onClick={prepareOrder}
            disabled={preparing || !!blockedReason}
            className="mt-4 w-full rounded-xl bg-bni-red py-3.5 font-bold text-white transition hover:bg-bni-red-strong disabled:opacity-50"
          >
            {blockedReason
              ? blockedReason
              : preparing
                ? t("주문 생성 중...", "Creating order...")
                : t(`${won(amount)} 주문 생성하기`, `Create order · ${won(amount)}`)}
          </button>
        ) : (
          <p className="mt-4 rounded-xl bg-bni-red-soft px-4 py-3 text-sm text-bni-red-dark">
            {t("주문이 생성되었습니다. 결제수단을 선택해 결제를 진행하세요.", "Your order has been created. Please proceed to payment.")}
            <br />
            {t("주문번호", "Order no.")}: {prepared.orderId}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
      </section>

      {prepared && (
        <section className="rounded-2xl border border-bni-line p-5">
          <h2 className="mb-4 text-lg font-bold">{t("결제수단", "Payment method")}</h2>
          <div className={intl ? "grid grid-cols-1 gap-2" : "grid grid-cols-3 gap-2"}>
            {methods.map((m) => (
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
            {paying ? t("결제창 이동 중...", "Opening payment window...") : t(`${won(prepared.amount)} 결제하기`, `Pay ${won(prepared.amount)}`)}
          </button>
        </section>
      )}
    </div>
  );
}
