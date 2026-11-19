import { db } from "@/db";
import { products } from "@/db/schema";
import { getProductById } from "@/lib/catalog";
import { isAdminRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return Response.json({ error: "Invalid id" }, { status: 400 });
  const product = await getProductById(id);
  if (!product) return Response.json({ error: "পণ্য পাওয়া যায়নি" }, { status: 404 });
  return Response.json({ product });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  const body = await request.json();
  if (body.stock === undefined && body.status === undefined) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }
  const [product] = await db
    .update(products)
    .set({ stock: body.stock !== undefined ? Number(body.stock) : undefined })
    .where(eq(products.id, id))
    .returning();
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ product });
}
