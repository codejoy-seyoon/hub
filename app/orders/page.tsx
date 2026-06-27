"use client";

import { useState } from "react";
import { won } from "@/lib/format";

type JourneyOrder = {
  order_no: string;
  domain: string;
  status: string;
  total_amount: number;
  paid_at: string | null;
  created_at: string;
  fulfillment: Record<string, unknown>;
};

const DOMAIN_LABEL: Record<string, string> = {
  store: "스토어 주문",
  ebook: "이북 구매",
  training: "트레이닝 수강",
  reservation: "대관 예약",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "결제완료",
  pending_payment: "결제대기",
  payment_failed: "결제실패",
  canceled: "취소됨",
};

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<JourneyOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch(`/api/lookup?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "조회에 실패했습니다.");
      setOrders(data.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-2 text-2xl font-extrabold">내 주문 조회</h1>
      <p className="mb-6 text-bni-body">결제 시 입력한 전화번호로 주문·예약·수강·구매 내역을 조회합니다.</p>

      <form onSubmit={lookup} className="flex gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="휴대폰 번호 (- 없이)"
          inputMode="numeric"
          className="h-12 flex-1 rounded-xl border border-bni-line px-4 outline-none focus:border-bni-red"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-bni-ink px-6 font-bold text-white disabled:opacity-50"
        >
          {loading ? "조회 중…" : "조회"}
        </button>
      </form>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {orders && orders.length === 0 && (
        <p className="mt-8 text-center text-bni-body">조회된 내역이 없습니다.</p>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.order_no} className="rounded-2xl border border-bni-line p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-bni-soft px-2.5 py-0.5 text-xs font-bold text-bni-body">
                  {DOMAIN_LABEL[o.domain] ?? o.domain}
                </span>
                <span className={`text-xs font-bold ${o.status === "paid" ? "text-emerald-600" : o.status === "canceled" || o.status === "payment_failed" ? "text-bni-red" : "text-bni-body"}`}>
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-sm text-bni-body">
                  <div>주문번호 {o.order_no}</div>
                  <div>{new Date(o.created_at).toLocaleString("ko-KR")}</div>
                </div>
                <strong className="text-bni-red">{won(o.total_amount)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
