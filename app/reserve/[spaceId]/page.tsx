import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpace } from "@/lib/data/spaces";
import { ReserveFlow } from "./ReserveFlow";

export default async function ReserveSpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const space = getSpace(spaceId);
  if (!space) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm text-bni-body">
        <Link href="/reserve" className="hover:text-bni-red">대관 예약</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-bni-ink">{space.name}</span>
      </nav>
      <ReserveFlow space={space} />
    </main>
  );
}
