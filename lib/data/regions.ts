import doc from "./_regions.json";

/* 주문자 소속(지역·챕터) 선택 목록.
   - 직영 지역: pay.bnikorea.com 드롭다운과 같은 목록(한글 챕터명)
   - 비직영 지역: BNI Connect의 활동중 챕터 + 코어 그룹(Connect 표기 그대로)
   자료 기준일과 출처는 _regions.json 안에 적혀 있다. */
export type RegionEntry = { region: string; source: string; chapters: string[] };

export const REGIONS: RegionEntry[] = doc.regions;
export const REGIONS_GENERATED: string = doc.generated;

// 멤버가 아니거나 목록에 소속이 없을 때 고르는 값
export const REGION_NONE = "해당 없음";
export const CHAPTER_OTHER = "목록에 없음";

export function chaptersOf(region: string): string[] {
  return REGIONS.find((entry) => entry.region === region)?.chapters ?? [];
}

/** 서버 검증용: 목록에 있는 조합인지 확인한다. */
export function isValidAffiliation(region: string, chapter: string): boolean {
  if (region === REGION_NONE) return chapter === REGION_NONE;
  const entry = REGIONS.find((item) => item.region === region);
  if (!entry) return false;
  return chapter === CHAPTER_OTHER || entry.chapters.includes(chapter);
}
