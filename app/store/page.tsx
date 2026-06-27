import { PRODUCTS } from "@/lib/data/products";
import { StoreGrid } from "./StoreGrid";

export const metadata = { title: "스토어 | BNI KOREA HUB" };

export default function StorePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">BNI KOREA STORE</h1>
        <p className="mt-2 text-bni-body">BNI 공식 굿즈를 만나보세요.</p>
      </header>
      <StoreGrid products={PRODUCTS} />
    </main>
  );
}
