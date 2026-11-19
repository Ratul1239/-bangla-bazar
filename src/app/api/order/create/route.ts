import { db } from "@/db";
import { cartItems, orderItems, orders, products } from "@/db/schema";
import { effectivePrice } from "@/lib/catalog";
import { normalizePhone } from "@/lib/phone";
import { getCart } from "@/lib/cart";
import { productName } from "@/lib/i18n";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { randomInt } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const deliveryChargeFor = (area: string) => (area === "inside" ? 60 : 120);

class StockError extends Error {
  productName: string;
  constructor(productName: string) {
    super("insufficient stock");
    this.productName = productName;
  }
}

function isUniqueViolation(error: unknown, constraint: string) {
  const err = error as { code?: string; constraint?: string; detail?: string; message?: string };
  if (err?.code !== "23505") return false;
  const haystack = `${err.constraint ?? ""} ${err.detail ?? ""} ${err.message ?? ""}`;
  return haystack.includes(constraint);
}

function newOrderCode() {
  return `ORD${randomInt(1000, 10000)}`;
}

async function findDuplicateOrder(idempotencyKey: string) {
  const [duplicate] = await db
    .select({ orderCode: orders.orderCode, id: orders.id, total: orders.total })
    .from(orders)
    .where(eq(orders.idempotencyKey, idempotencyKey))
    .limit(1);
  return duplicate ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId ?? "").trim();
    const customerName = String(body.customerName ?? "").trim();
    const phone = normalizePhone(String(body.phone ?? ""));
    const district = String(body.district ?? "").trim() || "ঢাকা";
    const thana = String(body.thana ?? "").trim();
    const address = String(body.address ?? "").trim();
    const note = String(body.note ?? "").trim();
    const deliveryArea = body.deliveryArea === "inside" ? "inside" : "outside";
    const rawKey = String(body.idempotencyKey ?? "").trim();
    // One key per checkout attempt — retries / double clicks reuse the same order.
    const idempotencyKey = /^[A-Za-z0-9-]{8,64}$/.test(rawKey) ? rawKey : null;

    if (customerName.length < 2) return Response.json({ error: "নাম লিখুন" }, { status: 400 });
    if (!/^01\d{9}$/.test(phone)) return Response.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
    if (address.length < 5) return Response.json({ error: "সম্পূর্ণ ঠিকানা লিখুন" }, { status: 400 });

    // Spike protection: per-shopper limit + per-IP limit.
    const ip = clientIp(request);
    const perShopper = rateLimit(`order:${ip}:${sessionId || "anon"}`, 10, 60_000);
    if (!perShopper.ok) {
      return Response.json({ error: "অনেকবার চেষ্টা করেছেন, একটু পরে আবার চেষ্টা করুন" }, { status: 429 });
    }
    const perIp = rateLimit(`order-ip:${ip}`, 150, 60_000);
    if (!perIp.ok) {
      return Response.json({ error: "সার্ভার ব্যস্ত আছে, একটু পরে আবার চেষ্টা করুন" }, { status: 429 });
    }

    // Fast path: this checkout attempt already created an order (retry / double click).
    if (idempotencyKey) {
      const duplicate = await findDuplicateOrder(idempotencyKey);
      if (duplicate) {
        return Response.json({ ok: true, orderCode: duplicate.orderCode, orderId: duplicate.id, total: duplicate.total, duplicate: true });
      }
    }

    const cart = await getCart(sessionId);
    if (cart.lines.length === 0) {
      // The cart was already cleared by the first of two rapid clicks:
      // return that order instead of a confusing "cart empty" error.
      if (idempotencyKey) {
        const duplicate = await findDuplicateOrder(idempotencyKey);
        if (duplicate) {
          return Response.json({ ok: true, orderCode: duplicate.orderCode, orderId: duplicate.id, total: duplicate.total, duplicate: true });
        }
      }
      return Response.json({ error: "কার্ট খালি" }, { status: 400 });
    }

    // Snapshot the cart: id + qty only. Prices/stock are re-read inside the
    // transaction so concurrent checkouts can't oversell or use stale prices.
    const lines = cart.lines.map((line) => ({ productId: line.product.id, quantity: Math.max(1, Math.min(20, line.quantity)) }));

    const deliveryCharge = deliveryChargeFor(deliveryArea);

    // Retry loop: only for rare random order-code collisions.
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderCode = attempt < 4 ? newOrderCode() : `ORD${Date.now().toString().slice(-6)}${randomInt(10, 100)}`;
      try {
        const result = await db.transaction(async (tx) => {
          // 1) Atomically reserve stock, one product row at a time.
          //    `stock >= qty` in WHERE + row lock means 1000 concurrent
          //    checkouts can never sell more units than exist.
          const reserved: { id: number; name: string; nameEn: string | null; imageUrl: string; price: number; discountPrice: number | null; quantity: number }[] = [];
          for (const line of lines) {
            const [row] = await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${line.quantity}` })
              .where(and(eq(products.id, line.productId), gte(products.stock, line.quantity)))
              .returning({
                id: products.id,
                name: products.name,
                nameEn: products.nameEn,
                imageUrl: products.imageUrl,
                price: products.price,
                discountPrice: products.discountPrice,
              });
            if (!row) {
              const [info] = await tx.select({ name: products.name }).from(products).where(eq(products.id, line.productId)).limit(1);
              throw new StockError(info?.name ?? "পণ্য");
            }
            reserved.push({ ...row, quantity: line.quantity });
          }

          const subtotal = reserved.reduce((sum, p) => sum + effectivePrice(p) * p.quantity, 0);
          const total = subtotal + deliveryCharge;

          // 2) Create the order + items.
          const [order] = await tx
            .insert(orders)
            .values({
              orderCode,
              customerName,
              phone,
              district,
              thana,
              address,
              note,
              paymentMethod: "cod",
              subtotal,
              deliveryCharge,
              total,
              status: "Pending",
              idempotencyKey,
            })
            .returning({ id: orders.id });

          await tx.insert(orderItems).values(
            reserved.map((p) => ({
              orderId: order.id,
              productId: p.id,
              name: p.name,
              nameEn: productName({ name: p.name, nameEn: p.nameEn }, "en"),
              imageUrl: p.imageUrl,
              price: effectivePrice(p),
              quantity: p.quantity,
            })),
          );

          // 3) Clear the cart only after everything above succeeded.
          await tx.delete(cartItems).where(eq(cartItems.sessionId, sessionId));

          return { orderId: order.id, total };
        });

        return Response.json({ ok: true, orderCode, orderId: result.orderId, total: result.total });
      } catch (error) {
        if (error instanceof StockError) {
          return Response.json({ error: `${error.productName} — স্টকের পরিমাণ কমে গেছে` }, { status: 400 });
        }
        // Same checkout retried concurrently: return the order the other request created.
        if (idempotencyKey && isUniqueViolation(error, "orders_idempotency_unique")) {
          const duplicate = await findDuplicateOrder(idempotencyKey);
          if (duplicate) {
            return Response.json({ ok: true, orderCode: duplicate.orderCode, orderId: duplicate.id, total: duplicate.total, duplicate: true });
          }
          return Response.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
        }
        // Random code collision: just try a fresh code.
        if (isUniqueViolation(error, "orders_code_unique")) continue;
        throw error;
      }
    }

    return Response.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
  }
}
