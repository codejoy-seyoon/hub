import raw from "./_spaces.json";

export type Space = {
  id: string;
  name: string;
  area: number;
  capacity: number;
  hourly_price: number;
  img: string;
  images?: string[];
  location?: string;
  description?: string;
  amenities?: string[];
};

export const SPACES: Space[] = raw as Space[];

const BY_ID = new Map(SPACES.map((s) => [s.id, s]));

export function getSpace(id: string): Space | undefined {
  return BY_ID.get(id);
}

/** 대관 공간 사진(Unsplash photo id) → URL */
export function spaceImg(photoId: string, w = 800): string {
  if (!photoId) return "";
  const h = Math.round(w * 0.62);
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export function spaceImages(s: Space): string[] {
  return s.images && s.images.length ? s.images : s.img ? [s.img] : [];
}

/** 대관 추가 옵션 (기존 reserve/app.js ADDONS 계승) */
export const SPACE_ADDONS = [
  { id: "laptop", name: "노트북 대여", price: 10000 },
  { id: "mic", name: "무선 마이크 추가", price: 5000 },
  { id: "beam", name: "추가 빔프로젝터", price: 15000 },
  { id: "snack", name: "다과 세트", price: 30000 },
] as const;

export type AddonId = (typeof SPACE_ADDONS)[number]["id"];

const ADDON_BY_ID = new Map(SPACE_ADDONS.map((a) => [a.id, a]));
export function getAddon(id: string) {
  return ADDON_BY_ID.get(id as AddonId);
}
