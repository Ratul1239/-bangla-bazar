import { getProducts } from "@/lib/catalog";
import HomeContent from "@/components/home-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts({ limit: 6 });
  return <HomeContent products={products} />;
}
