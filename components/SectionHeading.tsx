/* legacy 공통 섹션 헤더 (중앙 정렬: eyebrow + 제목 + 서브) */
export function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-red">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
      {sub ? <p className="mt-4 text-lg text-body">{sub}</p> : null}
    </div>
  );
}
