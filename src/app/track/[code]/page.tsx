import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import OrderDetail from "@/components/order-detail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ new?: string }> }) {
  const code = (await params).code.toUpperCase();
  const { new: isNew } = await searchParams;
  const [order] = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return <OrderDetail order={order} items={items} isNew={Boolean(isNew)} />;
}
