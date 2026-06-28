import { notFound } from "next/navigation";
import { getSpace } from "@/lib/data/spaces";
import { ReserveFlow } from "./ReserveFlow";
import { ReserveHeader } from "@/components/reserve/ReserveHeader";

export default async function ReserveSpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const space = getSpace(spaceId);
  if (!space) notFound();

  return (
    <>
      <ReserveHeader />
      <ReserveFlow space={space} />
    </>
  );
}
