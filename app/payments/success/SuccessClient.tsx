"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type VirtualAccount = {
  accountNumber?: string;
  bankCode?: string;
  bank?: string;
  customerName?: string;
  dueDate?: string;
};

type ConfirmResponse = {
  ok: boolean;
  alreadyConfirmed?: boolean;
  paymentStatus?: string;
  order: {
    orderNo: string;
    tossOrderId: string;
    domain: "store" | "ebook" | "training" | "reservation";
    amount: number;
    status: string;
    customerName: string;
  };
  payment: {
    paymentKey: string;
    method: string | null;
    approvedAmount: number;
    receiptUrl: string | null;
  };
  virtualAccount?: VirtualAccount | null;
};

const DOMAIN_DONE: Record<string, { title: string; desc: string; backHref: string; backLabel: string }> = {
  store: { title: "주문이 완료되었습니다", desc: "상품 주문과 결제가 정상 확정되었습니다.", backHref: "/store", backLabel: "스토어로" },
  ebook: { title: "구매가 완료되었습니다", desc: "전자책 열람 권한이 부여되었습니다.", backHref: "/ebook", backLabel: "이북으로" },
  training: { title: "수강 신청이 완료되었습니다", desc: "트레이닝 수강 신청과 결제가 확정되었습니다.", backHref: "/training", backLabel: "트레이닝으로" },
  reservation: { title: "예약이 완료되었습니다", desc: "대관 예약과 결제가 정상 확정되었습니다.", backHref: "/reserve", backLabel: "대관 예약으로" },
};

export function SuccessClient() {
  const sp = useSearchParams();
  const ran = useRef(false);
  const paymentKey = sp.get("paymentKey");
  const orderId = sp.get("orderId");
  const amount = sp.get("amount");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConfirmResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    if (!paymentKey || !orderId || !amount) {
      setError("필수 결제 파라미터가 없습니다.");
      setLoading(false);
      return;
    }
    ran.current = true;
    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "결제 승인에 실패했습니다.");
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "결제 승인 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentKey, orderId, amount]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">결제 승인 처리 중</h1>
        <p className="text-bni-body">결제 확인 및 주문 확정 작업을 진행하고 있습니다.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-3 text-2xl font-extrabold">결제 승인 실패</h1>
        <div className="mb-5 rounded-2xl bg-red-50 px-5 py-4 text-red-700">{error}</div>
        <Link href="/" className="font-semibold text-bni-red">홈으로 돌아가기</Link>
      </main>
    );
  }

  if (!data) return null;

  const meta = DOMAIN_DONE[data.order.domain] ?? DOMAIN_DONE.store;
  const waitingDeposit = data.paymentStatus === "WAITING_FOR_DEPOSIT";
  const va = data.virtualAccount;

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <div className="rounded-3xl border border-bni-line p-7">
        <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl ${waitingDeposit ? "bg-amber-50 text-amber-600" : "bg-bni-red-soft text-bni-red"}`}>
          {waitingDeposit ? "⏳" : "✓"}
        </div>
        <h1 className="mb-1 text-2xl font-extrabold">
          {waitingDeposit ? "가상계좌가 발급되었습니다" : meta.title}
        </h1>
        <p className="mb-6 text-bni-body">
          {waitingDeposit
            ? "아래 계좌로 입금하시면 결제가 자동으로 확정됩니다."
            : meta.desc}
        </p>

        {waitingDeposit && va && (
          <div className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm">
            <dl className="grid gap-1.5">
              <Row k="입금 은행" v={va.bank ?? va.bankCode ?? "-"} />
              <Row k="입금 계좌" v={va.accountNumber ?? "-"} />
              <Row k="입금 금액" v={`₩${Number(data.order.amount).toLocaleString("ko-KR")}`} />
              {va.dueDate && <Row k="입금 기한" v={new Date(va.dueDate).toLocaleString("ko-KR")} />}
            </dl>
          </div>
        )}

        <dl className="grid gap-2.5 border-t border-bni-line pt-5 text-sm">
          <Row k="주문번호" v={data.order.orderNo} />
          <Row k="결제금액" v={`₩${Number(data.order.amount).toLocaleString("ko-KR")}`} />
          <Row k="결제수단" v={data.payment.method ?? "-"} />
          <Row k="주문상태" v={waitingDeposit ? "입금대기" : data.order.status} />
          <Row k="주문자" v={data.order.customerName} />
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={meta.backHref}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-bni-ink px-5 font-semibold text-white"
          >
            {meta.backLabel}
          </Link>
          {data.payment.receiptUrl && (
            <a
              href={data.payment.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-bni-line px-5 font-semibold"
            >
              영수증 보기
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-bni-body">{k}</span>
      <strong className="text-right">{v}</strong>
    </div>
  );
}
