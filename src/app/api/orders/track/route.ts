import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return Response.json({ error: "অর্ডার আইডি দিন" }, { status: 400 });
  const [order] = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  if (!order) return Response.json({ error: "এই অর্ডার আইডি পাওয়া যায়নি" }, { status: 404 });
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(desc(orderItems.id));
  return Response.json({ order, items });
}
