"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_EVENT, fetchCart, getSessionId, type CartResponse } from "@/lib/client";
import { productName } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export default function CartPage() {
  const { language, t, money, number } = useLanguage();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => { fetchCart().then(setCart).catch(() => setCart({ lines: [], subtotal: 0, count: 0 })).finally(() => setLoading(false)); }, []);

  async function update(id: number, quantity: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: getSessionId(), quantity }) });
      const data = await res.json();
      if (res.ok) { setCart(data.cart); window.dispatchEvent(new Event(CART_EVENT)); }
    } finally { setBusyId(null); }
  }

  if (loading) return <div className="container-bn py-20 text-center text-[#7c887f]">{t("কার্ট লোড হচ্ছে...", "Loading your cart...")}</div>;
  const lines = cart?.lines ?? [];
  return (
    <div className="container-bn py-12">
      <span className="eyebrow">── {t("আপনার ব্যাগ", "Your bag")}</span>
      <h1 className="section-title mt-2">{t("শপিং কার্ট", "Shopping cart")}</h1>
      {lines.length === 0 ? (
        <div className="surface mt-8 py-20 text-center"><div className="text-6xl">🛒</div><h2 className="mt-5 text-[22px] font-bold text-[#0c3929]">{t("আপনার কার্ট খালি", "Your cart is empty")}</h2><p className="muted mt-2">{t("কিছু পণ্য যোগ করে কেনাকাটা শুরু করুন।", "Add something you love to get started.")}</p><Link href="/products" className="btn-primary mt-6">{t("পণ্য দেখতে যান", "Explore products")} →</Link></div>
      ) : (
        <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_350px]">
          <div className="space-y-3">{lines.map((line) => (
            <div key={line.id} className="surface flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <Link href={`/products/${line.product.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3efe6]"><img src={line.product.imageUrl} alt={productName(line.product, language)} className="h-full w-full object-cover" /></Link>
              <div className="min-w-[160px] flex-1"><Link href={`/products/${line.product.id}`} className="text-[17px] font-bold hover:text-[#14563d]">{productName(line.product, language)}</Link><p className="mt-1 text-[14px] font-semibold text-[#14563d]">{money(line.product.discountPrice ?? line.product.price)}</p><p className="mt-1 text-[12px] text-[#9aa59c]">{t("স্টক", "In stock")}: {number(line.product.stock)}</p></div>
              <div className="flex items-center rounded-xl border border-[#e2ded3] bg-white"><button aria-label={t("পরিমাণ কমান", "Decrease quantity")} disabled={busyId === line.id} onClick={() => update(line.id, line.quantity - 1)} className="h-9 w-9 text-lg font-bold text-[#14563d] disabled:opacity-50">−</button><span className="w-8 text-center text-[14px] font-bold">{number(line.quantity)}</span><button aria-label={t("পরিমাণ বাড়ান", "Increase quantity")} disabled={busyId === line.id || line.quantity >= line.product.stock} onClick={() => update(line.id, line.quantity + 1)} className="h-9 w-9 text-lg font-bold text-[#14563d] disabled:opacity-40">+</button></div>
              <p className="w-24 text-right text-[16px] font-bold">{money((line.product.discountPrice ?? line.product.price) * line.quantity)}</p>
              <button onClick={() => update(line.id, 0)} disabled={busyId === line.id} aria-label={t("পণ্য মুছুন", "Remove item")} className="text-[#a73333] hover:text-[#7d2222]"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" /></svg></button>
            </div>
          ))}</div>
          <aside className="surface h-fit p-6">
            <h2 className="text-[19px] font-bold text-[#0c3929]">{t("অর্ডার সারাংশ", "Order summary")}</h2>
            <div className="mt-5 space-y-3 border-b border-dashed border-[#e2ded3] pb-5 text-[15px]"><div className="flex justify-between"><span className="muted">{t(`সাবটোটাল (${number(cart?.count ?? 0)} টি)`, `Subtotal (${number(cart?.count ?? 0)} items)`)}</span><span className="font-semibold">{money(cart?.subtotal ?? 0)}</span></div><div className="flex justify-between"><span className="muted">{t("ডেলিভারি চার্জ", "Delivery")}</span><span className="text-[#ba4e2e]">{t("চেকআউটে নির্ধারিত", "Calculated at checkout")}</span></div></div>
            <div className="mt-5 flex justify-between text-[19px] font-bold"><span>{t("মোট", "Total")}</span><span className="text-[#14563d]">{money(cart?.subtotal ?? 0)}</span></div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">{t("চেকআউটে যান", "Proceed to checkout")} →</Link><Link href="/products" className="mt-4 block text-center text-[14px] font-semibold text-[#14563d]">{t("কেনাকাটা চালিয়ে যান", "Continue shopping")}</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
