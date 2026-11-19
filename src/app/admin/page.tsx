import { redirect } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import AdminDashboard, { type AdminOrder } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [orderRows, productRows] = await Promise.all([db.select().from(orders).orderBy(desc(orders.id)).limit(200), db.select().from(products).orderBy(desc(products.id))]);
  const ids = orderRows.map((o) => o.id);
  const itemRows = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
  const mappedOrders: AdminOrder[] = orderRows.map((order) => ({
    id: order.id, orderCode: order.orderCode, customerName: order.customerName, phone: order.phone,
    district: order.district, thana: order.thana, address: order.address, note: order.note,
    total: order.total, subtotal: order.subtotal, deliveryCharge: order.deliveryCharge, paymentMethod: order.paymentMethod, status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: itemRows.filter((item) => item.orderId === order.id).map((item) => ({ name: item.name, nameEn: item.nameEn, quantity: item.quantity, price: item.price })),
  }));
  return <AdminDashboard orders={mappedOrders} products={productRows.map((p) => ({ id: p.id, name: p.name, nameEn: p.nameEn, slug: p.slug, category: p.category, categoryEn: p.categoryEn, price: p.price, discountPrice: p.discountPrice, stock: p.stock, imageUrl: p.imageUrl }))} />;
}
