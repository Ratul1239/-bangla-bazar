import { getCategories, getProducts } from "@/lib/catalog";
import ProductsExplorer from "@/components/products-explorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "সকল পণ্য | All products — Bangla Bazar" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <ProductsExplorer products={products} categories={categories} />;
}
