import { db } from "@/db";
import { products } from "@/db/schema";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { effectivePrice } from "@/lib/pricing";
import { categoryName } from "@/lib/i18n";

const seedProducts = [
  {
    name: "প্রিমিয়াম কটন পাঞ্জাবি",
    slug: "premium-cotton-panjabi",
    description:
      "নরম খাঁটি কটন কাপড়ে তৈরি এই প্রিমিয়াম পাঞ্জাবি অনুষ্ঠান বা রোজকার ব্যবহারের জন্য একদম আদর্শ। হাতে তৈরি সূচিকর্ম, আরামদায়ক ফিট এবং টেকসই রং আপনার পোশাকের গুণগত মান বাড়িয়ে দেবে।",
    category: "পোশাক",
    price: 1690,
    discountPrice: 1290,
    stock: 24,
    imageUrl: "/images/panjabi.jpg",
    badge: "জনপ্রিয়",
    featured: true,
  },
  {
    name: "ওয়্যারলেস হেডফোন Pro",
    slug: "wireless-headphones-pro",
    description:
      "গভীর বাসের সাথে ৪০ ঘণ্টার ব্যাটারি ব্যাকআপ, নয়েজ ক্যান্সেলেশন এবং কমফোর্টেবল ইয়ার কুশন। কাজ, পড়াশোনা বা ভ্রমণ—সব জায়গায় আপনার সঙ্গী।",
    category: "ইলেকট্রনিক্স",
    price: 2490,
    discountPrice: 1890,
    stock: 15,
    imageUrl: "/images/headphones.jpg",
    badge: "হট সেল",
    featured: true,
  },
  {
    name: "ক্লাসিক স্টেইনলেস ওয়াচ",
    slug: "classic-stainless-watch",
    description:
      "স্টেইনলেস স্টিলের বডি এবং নেভি ব্লু ডায়ালের এই ওয়াচ যেকোনো পোশাকের সাথে মানানসই। পানি প্রতিরোধী এবং দীর্ঘস্থায়ী কোয়ার্টজ মুভমেন্ট।",
    category: "অ্যাক্সেসরিজ",
    price: 3290,
    discountPrice: 2490,
    stock: 9,
    imageUrl: "/images/watch.jpg",
    badge: null,
    featured: true,
  },
  {
    name: "কটন বেসিক টি-শার্ট",
    slug: "cotton-basic-tshirt",
    description:
      "খাঁটি কটনের তৈরি হালকা ও শ্বাস-প্রশ্বাসযোগ্য টি-শার্ট। রোজকার ব্যবহারের জন্য আরামদায়ক ফিট এবং বারবার ধোয়ার পরও আকার অটুট থাকে।",
    category: "পোশাক",
    price: 790,
    discountPrice: 590,
    stock: 42,
    imageUrl: "/images/tshirt.jpg",
    badge: "নতুন",
    featured: false,
  },
  {
    name: "প্রিমিয়াম লেদার ব্যাগ",
    slug: "premium-leather-bag",
    description:
      "টেকসই জিনুইন লেদারের তৈরি এই মেসেঞ্জার ব্যাগে আপনার ল্যাপটপ, বই এবং ছোট জিনিসপত্র সুন্দরভাবে রাখা যায়। এডজাস্টেবল স্ট্র্যাপ ও একাধিক কম্পার্টমেন্ট।",
    category: "অ্যাক্সেসরিজ",
    price: 2190,
    discountPrice: 1690,
    stock: 12,
    imageUrl: "/images/bag.jpg",
    badge: null,
    featured: false,
  },
  {
    name: "কোজি নিট সোয়েটার",
    slug: "cozy-knit-sweater",
    description:
      "শীতের দিনে উষ্ণতা এবং আরামের জন্য নরম নিটেড সোয়েটার। হালকা, টেকসই এবং যেকোনো ক্যাজুয়াল পোশাকের সাথে সুন্দরভাবে মেলে।",
    category: "পোশাক",
    price: 1490,
    discountPrice: 1190,
    stock: 18,
    imageUrl: "/images/sweater.jpg",
    badge: "শীতকালীন",
    featured: false,
  },
];

export async function ensureSeeded() {
  const [result] = await db.select({ value: count() }).from(products);
  if (result && result.value > 0) return;
  await db
    .insert(products)
    .values(seedProducts)
    .onConflictDoNothing({ target: products.slug });
}

export type ProductQuery = {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
};

export async function getProducts(query: ProductQuery = {}) {
  await ensureSeeded();
  // Filters run inside SQL (not in JS) so listing stays fast when the catalog
  // grows and hundreds of shoppers browse at once.
  const conditions: SQL[] = [];
  if (query.category && query.category !== "সব" && query.category.toLowerCase() !== "all") {
    conditions.push(or(eq(products.category, query.category), eq(products.categoryEn, query.category)) as SQL);
  }
  if (query.search?.trim()) {
    const term = `%${query.search.trim().replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.nameEn, term),
        ilike(products.description, term),
        ilike(products.category, term),
      ) as SQL,
    );
  }
  const effective = sql`COALESCE(${products.discountPrice}, ${products.price})`;
  const orderBy =
    query.sort === "price-asc"
      ? [asc(effective), desc(products.id)]
      : query.sort === "price-desc"
        ? [desc(effective), desc(products.id)]
        : query.sort === "newest"
          ? [desc(products.id)]
          : [desc(products.featured), desc(products.id)];
  const base = db.select().from(products).where(conditions.length ? and(...conditions) : undefined).orderBy(...orderBy);
  const rows = query.limit ? await base.limit(query.limit) : await base;

  // Client quirk: English category labels submitted for Bengali rows (e.g.
  // "Clothing" for "পোশাক"). Covers label aliases without extra DB roundtrips.
  if (query.category && query.category !== "সব" && query.category.toLowerCase() !== "all") {
    const wanted = query.category.toLowerCase();
    const aliased = rows.filter(
      (p) => p.category.toLowerCase() === wanted || categoryName(p.category, "en", p.categoryEn).toLowerCase() === wanted,
    );
    if (aliased.length !== rows.length) return query.limit ? aliased.slice(0, query.limit) : aliased;
  }
  return rows;
}

export async function getProductById(id: number) {
  await ensureSeeded();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product ?? null;
}

export async function getCategories() {
  await ensureSeeded();
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .orderBy(sql`${products.category} asc`);
  return rows.map((r) => r.category);
}

export { effectivePrice, formatBDT } from "@/lib/pricing";
