"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CART_EVENT, fetchCart, getSessionId, type CartResponse } from "@/lib/client";
import { localizeError, productName } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

type Zone = "inside" | "outside";

export default function CheckoutPage() {
  const router = useRouter();
  const { language, t, money, number } = useLanguage();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [zone, setZone] = useState<Zone>("inside");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("ঢাকা");
  const [thana, setThana] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Unique per checkout attempt: if the shopper double-clicks or the request
  // retries, the server returns the SAME order instead of creating two.
  const idempotencyKey = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const delivery = zone === "inside" ? 60 : 120;
  const subtotal = cart?.subtotal ?? 0;
  const districtDisplay = district === "ঢাকা" || district === "Dhaka" ? t("ঢাকা", "Dhaka") : district;

  useEffect(() => { fetchCart().then(setCart).catch(() => setCart({ lines: [], subtotal: 0, count: 0 })); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/order/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: getSessionId(), customerName: name, phone, district: districtDisplay, thana, address, note, deliveryArea: zone, idempotencyKey: idempotencyKey.current }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.dispatchEvent(new Event(CART_EVENT));
      router.push(`/track/${data.orderCode}?new=1`);
    } catch (e) { setError(e instanceof Error ? e.message : t("অর্ডার করা যায়নি", "Could not place your order.")); setSubmitting(false); }
  }

  return (
    <div className="container-bn py-12">
      <span className="eyebrow">── {t("প্রায় শেষ", "Almost there")}</span><h1 className="section-title mt-2">{t("চেকআউট ও অর্ডার", "Checkout")}</h1><p className="muted mt-2 text-[15px]">{t("আপনার তথ্য দিন, অর্ডার কনফার্ম করুন এবং ক্যাশ দিয়ে পণ্য নিন।", "Enter your details, place your order, and pay in cash on delivery.")}</p>
      <form onSubmit={submit} className="mt-9 grid gap-7 lg:grid-cols-[1fr_370px]">
        <div className="space-y-6">
          <section className="surface p-6"><h2 className="text-[19px] font-bold text-[#0c3929]">{t("১. কাস্টমারের তথ্য", "1. Customer information")}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label htmlFor="checkout-name" className="label-bn">{t("পুরো নাম *", "Full name *")}</label><input id="checkout-name" className="input-bn" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("আপনার নাম", "Your full name")} autoComplete="name" /></div><div><label htmlFor="checkout-phone" className="label-bn">{t("মোবাইল নম্বর *", "Mobile number *")}</label><input id="checkout-phone" className="input-bn" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></div></div><p className="mt-3 text-[13px] text-[#859087]">{t("অর্ডার সম্পর্কে আমাদের দল এই নম্বরেই যোগাযোগ করবে।", "Our team will contact you at this number about your order.")}</p></section>
          <section className="surface p-6"><h2 className="text-[19px] font-bold text-[#0c3929]">{t("২. ডেলিভারি ঠিকানা", "2. Delivery address")}</h2><div className="mt-5"><label className="label-bn">{t("ডেলিভারি এরিয়া বাছুন *", "Choose a delivery area *")}</label><div role="radiogroup" aria-label={t("ডেলিভারি এরিয়া", "Delivery area")} className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "inside" as Zone, title: t("ঢাকার ভেতরে", "Inside Dhaka"), sub: t("ডেলিভারি চার্জ ৬০ টাকা", "Delivery fee ৳60") },
              { key: "outside" as Zone, title: t("ঢাকার বাইরে", "Outside Dhaka"), sub: t("ডেলিভারি চার্জ ১২০ টাকা", "Delivery fee ৳120") },
            ]).map((option) => <button type="button" role="radio" aria-checked={zone === option.key} key={option.key} onClick={() => { setZone(option.key); setDistrict(option.key === "inside" ? "ঢাকা" : ""); }} className={`rounded-xl border-2 p-4 text-left transition ${zone === option.key ? "border-[#14563d] bg-[#f0f7f2]" : "border-[#e7e3d8] bg-white hover:border-[#b9cdbf]"}`}><span className="flex items-center gap-2 text-[15px] font-bold"><span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${zone === option.key ? "border-[#14563d]" : "border-[#c8cec9]"}`}>{zone === option.key && <span className="h-2 w-2 rounded-full bg-[#14563d]" />}</span>{option.title}</span><span className="mt-1 block pl-6 text-[13px] text-[#7c887f]">{option.sub}</span></button>)}
          </div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label htmlFor="checkout-district" className="label-bn">{t("জেলা *", "District *")}</label><input id="checkout-district" className="input-bn" required value={districtDisplay} onChange={(e) => setDistrict(e.target.value)} placeholder={t("যেমন: ঢাকা, চট্টগ্রাম", "e.g. Dhaka, Chattogram")} /></div><div><label htmlFor="checkout-thana" className="label-bn">{t("থানা / উপজেলা", "Thana / upazila")}</label><input id="checkout-thana" className="input-bn" value={thana} onChange={(e) => setThana(e.target.value)} placeholder={t("যেমন: মিরপুর", "e.g. Mirpur")} /></div></div><div className="mt-4"><label htmlFor="checkout-address" className="label-bn">{t("সম্পূর্ণ ঠিকানা *", "Full address *")}</label><textarea id="checkout-address" className="input-bn min-h-[90px] resize-y" required minLength={5} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("বাড়ি নম্বর, রাস্তা, এলাকা...", "House number, street, area...")} autoComplete="street-address" /></div><div className="mt-4"><label htmlFor="checkout-note" className="label-bn">{t("অর্ডার নোট (ঐচ্ছিক)", "Order note (optional)")}</label><textarea id="checkout-note" className="input-bn min-h-[70px] resize-y" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("কোনো বিশেষ নির্দেশনা...", "Any special instructions...")} /></div></section>
          <section className="surface p-6"><h2 className="text-[19px] font-bold text-[#0c3929]">{t("৩. পেমেন্ট মেথড", "3. Payment method")}</h2><div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-[#14563d] bg-[#f0f7f2] p-4"><span className="text-2xl">💵</span><div className="flex-1"><p className="font-bold">{t("ক্যাশ অন ডেলিভারি (COD)", "Cash on delivery (COD)")}</p><p className="text-[13px] text-[#7c887f]">{t("পণ্য হাতে পেয়ে ক্যাশ দিন। কোনো অগ্রিম পেমেন্ট নেই।", "Pay cash when your order arrives. No advance payment required.")}</p></div><span className="text-[#14563d]">☑</span></div></section>
          {error && <div role="alert" className="rounded-xl bg-[#fdeaea] px-4 py-3 text-[14px] font-semibold text-[#a73333]">⚠ {localizeError(error, language, t("অর্ডার করা যায়নি", "Could not place your order."))}</div>}
        </div>
        <aside className="surface h-fit p-6 lg:sticky lg:top-24"><h2 className="text-[19px] font-bold text-[#0c3929]">{t("আপনার অর্ডার", "Your order")}</h2><div className="mt-4 max-h-[260px] space-y-3 overflow-y-auto border-b border-dashed border-[#e2ded3] pb-4">{(cart?.lines ?? []).map((line) => <div key={line.id} className="flex items-center gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f3efe6]"><img src={line.product.imageUrl} alt="" className="h-full w-full object-cover" /><span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#14563d] text-[10px] font-bold text-white">{number(line.quantity)}</span></div><p className="line-clamp-1 flex-1 text-[14px] font-semibold">{productName(line.product, language)}</p><p className="text-[13px] font-bold">{money((line.product.discountPrice ?? line.product.price) * line.quantity)}</p></div>)}{cart?.lines.length === 0 && <p className="py-4 text-center text-[14px] text-[#859087]">{t("কার্ট খালি", "Your cart is empty")}</p>}</div><div className="mt-4 space-y-2.5 text-[15px]"><div className="flex justify-between"><span className="muted">{t("সাবটোটাল", "Subtotal")}</span><span className="font-semibold">{money(subtotal)}</span></div><div className="flex justify-between gap-2"><span className="muted">{t("ডেলিভারি চার্জ", "Delivery fee")} ({zone === "inside" ? t("ঢাকার ভেতরে", "Inside Dhaka") : t("ঢাকার বাইরে", "Outside Dhaka")})</span><span className="shrink-0 font-semibold">{money(delivery)}</span></div></div><div className="mt-4 flex justify-between border-t border-[#e7e3d8] pt-4 text-[19px] font-bold"><span>{t("মোট পরিশোধযোগ্য", "Total payable")}</span><span className="text-[#14563d]">{money(subtotal + delivery)}</span></div><button type="submit" disabled={submitting || !cart?.lines.length} className="btn-primary mt-6 w-full !py-3.5">{submitting ? t("অর্ডার তৈরি হচ্ছে...", "Placing order...") : t("✓ অর্ডার কনফার্ম করুন", "✓ Place your order")}</button><p className="mt-3 text-center text-[12px] text-[#859087]">🔒 {t("আপনার তথ্য নিরাপদ রাখা হয়", "Your information is kept secure")}</p><Link href="/cart" className="mt-4 block text-center text-[14px] font-semibold text-[#14563d]">← {t("কার্টে ফিরে যান", "Back to cart")}</Link></aside>
      </form>
    </div>
  );
}
