export const CART_EVENT = "banga-cart-changed";

export function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("banga_session_id");
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem("banga_session_id", id);
  }
  return id;
}

export function notifyCartChanged() {
  window.dispatchEvent(new Event(CART_EVENT));
}

export type CartLine = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    nameEn: string | null;
    slug: string;
    imageUrl: string;
    price: number;
    discountPrice: number | null;
    stock: number;
  };
};

export type CartResponse = {
  lines: CartLine[];
  subtotal: number;
  count: number;
};

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`/api/cart?sessionId=${encodeURIComponent(getSessionId())}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Cart fetch failed");
  return res.json();
}

export function bdt(amount: number) {
  return `${amount.toLocaleString("bn-BD")} টাকা`;
}
