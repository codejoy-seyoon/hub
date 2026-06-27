import { z } from "zod";
import { getProduct } from "./data/products";
import { getBook } from "./data/books";
import { getTraining } from "./data/trainings";
import { getSpace, getAddon } from "./data/spaces";

/* ============================================================
   통합 주문 카탈로그
   - 결제 금액은 절대 클라이언트 입력을 신뢰하지 않고
     서버측 데이터(lib/data/*)로 재계산한다.
   - 스토어/이북/트레이닝/대관 4개 도메인을 하나의 주문 라인으로 정규화.
   ============================================================ */

export const customerSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요."),
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  phone: z.string().min(8, "전화번호를 입력하세요."),
});
export type Customer = z.infer<typeof customerSchema>;

const storeCart = z.object({
  domain: z.literal("store"),
  customer: customerSchema,
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1, "주문 상품이 없습니다."),
});

const ebookCart = z.object({
  domain: z.literal("ebook"),
  customer: customerSchema,
  items: z
    .array(z.object({ bookId: z.string() }))
    .min(1, "주문 도서가 없습니다."),
});

const trainingCart = z.object({
  domain: z.literal("training"),
  customer: customerSchema,
  trainingId: z.string(),
});

const reservationCart = z.object({
  domain: z.literal("reservation"),
  customer: customerSchema,
  spaceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다."),
  durationMinutes: z.number().int().positive().max(600),
  addonIds: z.array(z.string()).default([]),
  memo: z.string().max(500).optional().default(""),
});

export const orderRequestSchema = z.discriminatedUnion("domain", [
  storeCart,
  ebookCart,
  trainingCart,
  reservationCart,
]);
export type OrderRequest = z.infer<typeof orderRequestSchema>;

export type OrderLine = {
  kind: "product" | "book" | "training" | "space" | "addon";
  refId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type BuiltOrder = {
  domain: OrderRequest["domain"];
  lines: OrderLine[];
  orderName: string;
  amounts: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  /** 결제 승인 후 이행(fulfillment)에 필요한 도메인별 정보 */
  fulfillment: Record<string, unknown>;
};

function orderName(lines: OrderLine[]): string {
  if (lines.length === 0) return "주문";
  const first = lines[0].name;
  const more = lines.length - 1;
  return more > 0 ? `${first} 외 ${more}건` : first;
}

/**
 * 클라이언트 요청을 서버 데이터로 검증·재계산해 정규 주문으로 변환.
 * 알 수 없는 상품/공간이면 throw.
 */
export function buildOrder(req: OrderRequest): BuiltOrder {
  if (req.domain === "store") {
    const lines: OrderLine[] = req.items.map((it) => {
      const p = getProduct(it.productId);
      if (!p) throw new Error(`알 수 없는 상품입니다: ${it.productId}`);
      if (p.stock <= 0) throw new Error(`품절된 상품입니다: ${p.name}`);
      return {
        kind: "product",
        refId: p.id,
        name: p.name,
        unitPrice: p.price,
        quantity: it.quantity,
        lineTotal: p.price * it.quantity,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal >= 50000 ? 0 : 3000;
    return {
      domain: "store",
      lines,
      orderName: orderName(lines),
      amounts: { subtotal, discount: 0, shipping, total: subtotal + shipping },
      fulfillment: {},
    };
  }

  if (req.domain === "ebook") {
    const lines: OrderLine[] = req.items.map((it) => {
      const b = getBook(it.bookId);
      if (!b) throw new Error(`알 수 없는 도서입니다: ${it.bookId}`);
      return {
        kind: "book",
        refId: b.id,
        name: b.title,
        unitPrice: b.price,
        quantity: 1,
        lineTotal: b.price,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return {
      domain: "ebook",
      lines,
      orderName: orderName(lines),
      amounts: { subtotal, discount: 0, shipping: 0, total: subtotal },
      fulfillment: { bookIds: lines.map((l) => l.refId) },
    };
  }

  if (req.domain === "training") {
    const t = getTraining(req.trainingId);
    if (!t) throw new Error(`알 수 없는 트레이닝입니다: ${req.trainingId}`);
    const line: OrderLine = {
      kind: "training",
      refId: t.id,
      name: `${t.title} 수강`,
      unitPrice: t.price,
      quantity: 1,
      lineTotal: t.price,
    };
    return {
      domain: "training",
      lines: [line],
      orderName: line.name,
      amounts: { subtotal: t.price, discount: 0, shipping: 0, total: t.price },
      fulfillment: { trainingId: t.id, date: t.date, time: t.time },
    };
  }

  // reservation
  const space = getSpace(req.spaceId);
  if (!space) throw new Error(`알 수 없는 공간입니다: ${req.spaceId}`);
  const base = Math.round((space.hourly_price * req.durationMinutes) / 60);
  const lines: OrderLine[] = [
    {
      kind: "space",
      refId: space.id,
      name: `${space.name} 대관 (${req.durationMinutes}분)`,
      unitPrice: base,
      quantity: 1,
      lineTotal: base,
    },
  ];
  for (const id of req.addonIds) {
    const a = getAddon(id);
    if (!a) throw new Error(`알 수 없는 옵션입니다: ${id}`);
    lines.push({
      kind: "addon",
      refId: a.id,
      name: a.name,
      unitPrice: a.price,
      quantity: 1,
      lineTotal: a.price,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return {
    domain: "reservation",
    lines,
    orderName: `${space.name} 대관${
      req.addonIds.length ? ` 외 ${req.addonIds.length}건` : ""
    }`,
    amounts: { subtotal, discount: 0, shipping: 0, total: subtotal },
    fulfillment: {
      spaceId: space.id,
      date: req.date,
      time: req.time,
      durationMinutes: req.durationMinutes,
      addonIds: req.addonIds,
      memo: req.memo,
    },
  };
}
