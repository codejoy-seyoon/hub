import Link from "next/link";
import { notFound } from "next/navigation";
import { getTraining, trainingImg } from "@/lib/data/trainings";
import { won } from "@/lib/format";

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = getTraining(id);
  if (!t) notFound();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <nav className="mb-6 text-sm text-bni-body">
        <Link href="/training" className="hover:text-bni-red">트레이닝</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-bni-ink">{t.title}</span>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-bni-line">
        <div className="aspect-video overflow-hidden bg-bni-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trainingImg(t.img, 1000)} alt={t.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-extrabold">{t.title}</h1>
          <dl className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
            <Field k="챕터" v={t.chapter} />
            <Field k="강사" v={t.who} />
            <Field k="일시" v={`${t.date} ${t.time}`} />
            <Field k="정원" v={`${t.capacity}명`} />
            <Field k="모집상태" v={t.status} />
            <Field k="수강료" v={won(t.price)} />
          </dl>

          <Link
            href={`/training/checkout?trainingId=${t.id}`}
            className="mt-7 inline-flex h-13 w-full items-center justify-center rounded-xl bg-bni-ink py-3.5 font-bold text-white transition hover:opacity-90"
          >
            수강 신청하기
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-bni-body">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
