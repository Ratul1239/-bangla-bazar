"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionId, notifyCartChanged } from "@/lib/client";
import { localizeError } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

export default function AddToCartButton({ productId, stock, label, compact = false }: { productId: number; stock: number; label?: string; compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const { language, t } = useLanguage();

  async function add() {
    if (stock <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: getSessionId(), productId, quantity: 1 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(localizeError(data.error, language, t("কার্টে যোগ করা যায়নি", "Could not add to cart.")));
      notifyCartChanged();
      setToast(t("✓ পণ্যটি কার্টে যোগ হয়েছে", "✓ Added to your cart"));
      router.refresh();
      setTimeout(() => setToast(""), 2200);
    } catch (error) {
      setToast(error instanceof Error ? error.message : t("কার্টে যোগ করা যায়নি", "Could not add to cart."));
      setTimeout(() => setToast(""), 2500);
    } finally { setLoading(false); }
  }

  return <><button onClick={add} disabled={loading || stock <= 0} className={compact ? "btn-primary w-full !rounded-lg !py-2.5 !text-[13px]" : "btn-primary w-full"}>{loading ? t("যোগ করা হচ্ছে...", "Adding...") : stock <= 0 ? t("স্টক নেই", "Out of stock") : label ?? t("কার্টে যোগ করুন", "Add to cart")}</button>{toast && <div className="toast" role="status">{toast}</div>}</>;
}
