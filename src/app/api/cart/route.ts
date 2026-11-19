import { getCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });
  const cart = await getCart(sessionId);
  return Response.json(cart);
}
