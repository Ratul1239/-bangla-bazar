import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getCart } from "@/lib/cart";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json();
  const id = Number((await params).id);
  const sessionId = String(body.sessionId ?? "");
  const quantity = Number(body.quantity);
  if (!sessionId || !Number.isInteger(quantity)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity: Math.min(20, quantity), updatedAt: new Date() })
      .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
  }
  return Response.json({ ok: true, cart: await getCart(sessionId) });
}

export async function DELETE(request: Request, { params }: Params) {
  const sessionId = new URL(request.url).searchParams.get("sessionId") ?? "";
  const id = Number((await params).id);
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
  return Response.json({ ok: true, cart: await getCart(sessionId) });
}
