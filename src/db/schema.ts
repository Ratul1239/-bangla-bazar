import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    descriptionEn: text("description_en"),
    category: text("category").notNull().default("অন্যান্য"),
    categoryEn: text("category_en"),
    price: integer("price").notNull(),
    discountPrice: integer("discount_price"),
    stock: integer("stock").notNull().default(0),
    imageUrl: text("image_url").notNull().default(""),
    badge: text("badge"),
    badgeEn: text("badge_en"),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("products_slug_unique").on(table.slug)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_session_product_unique").on(table.sessionId, table.productId),
    index("cart_session_idx").on(table.sessionId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderCode: text("order_code").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    district: text("district").notNull(),
    thana: text("thana").notNull().default(""),
    address: text("address").notNull(),
    note: text("note").notNull().default(""),
    paymentMethod: text("payment_method").notNull().default("cod"),
    subtotal: integer("subtotal").notNull(),
    deliveryCharge: integer("delivery_charge").notNull(),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    status: text("status").notNull().default("Pending"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_code_unique").on(table.orderCode),
    uniqueIndex("orders_idempotency_unique").on(table.idempotencyKey),
    index("orders_status_idx").on(table.status),
    index("orders_created_idx").on(table.createdAt),
    index("orders_phone_idx").on(table.phone),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    imageUrl: text("image_url").notNull().default(""),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
