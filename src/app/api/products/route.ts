import { db } from "@/db";
import { products } from "@/db/schema";
import { getProducts } from "@/lib/catalog";
import { isAdminRequest } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const list = await getProducts({
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      limit: Number(searchParams.get("limit")) || undefined,
    });
    return Response.json({ products: list, count: list.length });
  } catch {
    return Response.json({ error: " products load করতে ব্যর্থ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.slug) {
      return Response.json({ error: "নাম, স্লাগ এবং দাম আবশ্যক" }, { status: 400 });
    }
    const [product] = await db
      .insert(products)
      .values({
        name: String(body.name).trim(),
        nameEn: body.nameEn ? String(body.nameEn).trim() : null,
        slug: String(body.slug).trim(),
        description: String(body.description ?? ""),
        descriptionEn: body.descriptionEn ? String(body.descriptionEn).trim() : null,
        category: String(body.category ?? "অন্যান্য"),
        categoryEn: body.categoryEn ? String(body.categoryEn).trim() : null,
        price: Number(body.price),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        stock: Number(body.stock ?? 0),
        imageUrl: String(body.imageUrl ?? "/images/tshirt.jpg"),
        badge: body.badge ? String(body.badge) : null,
        badgeEn: body.badgeEn ? String(body.badgeEn).trim() : null,
        featured: Boolean(body.featured),
      })
      .returning();
    return Response.json({ product }, { status: 201 });
  } catch {
    return Response.json({ error: "পণ্য যোগ করা যায়নি" }, { status: 500 });
  }
}
