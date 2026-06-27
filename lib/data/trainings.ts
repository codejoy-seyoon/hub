import raw from "./_trainings.json";

type RawTraining = {
  id: string;
  day: number;
  title: string;
  chapter: string;
  who: string;
  time: string;
  status: string;
  img: string;
};

export type Training = RawTraining & {
  price: number;
  capacity: number;
  date: string; // YYYY-MM-DD (2026-06 기준)
};

// 트레이닝별 수강료 (기존 데이터엔 가격이 없어 새로 정의)
const PRICE_BY_ID: Record<string, number> = {
  t1: 30000, t2: 20000, t3: 20000, t4: 30000, t5: 80000,
  t6: 30000, t7: 20000, t8: 50000, t9: 60000, t10: 40000,
  t11: 40000, t12: 30000, t13: 80000, t14: 30000, t15: 40000,
};
const DEFAULT_PRICE = 30000;
const DEFAULT_CAPACITY = 30;

export const TRAININGS: Training[] = (raw as RawTraining[]).map((t) => ({
  ...t,
  price: PRICE_BY_ID[t.id] ?? DEFAULT_PRICE,
  capacity: DEFAULT_CAPACITY,
  date: `2026-06-${String(t.day).padStart(2, "0")}`,
}));

const BY_ID = new Map(TRAININGS.map((t) => [t.id, t]));

export function getTraining(id: string): Training | undefined {
  return BY_ID.get(id);
}

/** 트레이닝 카드 이미지 (Unsplash photo id) */
export function trainingImg(photoId: string, w = 600): string {
  if (!photoId) return "";
  const h = Math.round(w * 0.62);
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}
