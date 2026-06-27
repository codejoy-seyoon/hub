import { Suspense } from "react";
import { FailClient } from "./FailClient";

export default function FailPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-5 py-16" />}>
      <FailClient />
    </Suspense>
  );
}
