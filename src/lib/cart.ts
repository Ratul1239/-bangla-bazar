import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { effectivePrice, ensureSeeded } from "@/lib/catalog";
import { asc, eq } from "drizzle-orm";

export type CartLine = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    nameEn: string | null;
    slug: string;
    imageUrl: string;
    price: number;
    discountPrice: number | null;
    stock: number;
  };
};

export async function getCart(sessionId: string) {
  await ensureSeeded();
  const rows = await db
    .select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId))
    .orderBy(asc(cartItems.id));
  const lines: CartLine[] = rows.map(({ item, product }) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
    },
  }));
  const subtotal = lines.reduce((sum, line) => sum + effectivePrice(line.product) * line.quantity, 0);
  return { lines, subtotal, count: lines.reduce((sum, line) => sum + line.quantity, 0) };
}
