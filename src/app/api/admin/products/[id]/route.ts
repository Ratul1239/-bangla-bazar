import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  const body = await request.json();
  const [product] = await db
    .update(products)
    .set({
      stock: body.stock !== undefined ? Math.max(0, Number(body.stock)) : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
    })
    .where(eq(products.id, id))
    .returning();
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, product });
}
