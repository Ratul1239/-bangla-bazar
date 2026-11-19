import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  const { status } = await request.json();
  if (!STATUSES.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  const [order] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, order });
}
