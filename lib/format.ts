export function won(n: number): string {
  return "₩" + Number(n || 0).toLocaleString("ko-KR");
}

export type Currency = "KRW" | "USD";

/** 통화에 맞춘 금액 표시. 원화는 ₩380,000, 달러는 USD 480.00 (카페24 영문몰 표기와 같다). */
export function money(n: number, currency: string | null | undefined = "KRW"): string {
  if (currency === "USD") {
    return "USD " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return won(n);
}
