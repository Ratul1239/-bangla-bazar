import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/catalog";
import ProductDetail from "@/components/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const product = await getProductById(id);
  if (!product) notFound();
  const related = (await getProducts({ category: product.category })).filter((p) => p.id !== product.id).slice(0, 3);
  return <ProductDetail product={product} related={related} />;
}
