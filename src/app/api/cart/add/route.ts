import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getCart } from "@/lib/cart";
import { getProductById } from "@/lib/catalog";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId ?? "").trim();
    const productId = Number(body.productId);
    const quantity = Math.max(1, Math.min(20, Number(body.quantity ?? 1)));
    if (!sessionId || !Number.isInteger(productId)) {
      return Response.json({ error: "sessionId ও productId আবশ্যক" }, { status: 400 });
    }
    const product = await getProductById(productId);
    if (!product) return Response.json({ error: "পণ্য পাওয়া যায়নি" }, { status: 404 });

    // Retry once: two rapid clicks can both pass the "existing?" check and
    // then collide on the (session, product) unique key. The retry turns the
    // loser into an update instead of a 500 error.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [existing] = await db
          .select()
          .from(cartItems)
          .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)))
          .limit(1);

        if (existing) {
          await db
            .update(cartItems)
            .set({ quantity: Math.min(product.stock, existing.quantity + quantity), updatedAt: new Date() })
            .where(eq(cartItems.id, existing.id));
        } else {
          await db.insert(cartItems).values({
            sessionId,
            productId,
            quantity: Math.min(product.stock, quantity),
          });
        }
        break;
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === "23505" && attempt === 0) continue;
        throw error;
      }
    }

    const cart = await getCart(sessionId);
    return Response.json({ ok: true, cart });
  } catch {
    return Response.json({ error: "কার্টে যোগ করা যায়নি" }, { status: 500 });
  }
}
