"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { localizeError } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export default function TrackPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code.trim().replace(/^#/, ""))}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/track/${data.order.orderCode}`);
    } catch (e) { setError(e instanceof Error ? e.message : t("ট্র্যাক করা যায়নি", "Could not find the order.")); }
    finally { setLoading(false); }
  }
  return (
    <div className="container-bn py-16"><div className="mx-auto max-w-2xl text-center">
      <span className="eyebrow justify-center">── {t("অর্ডার স্ট্যাটাস", "Order status")}</span><h1 className="section-title mt-2">{t("আপনার অর্ডার ট্র্যাক করুন", "Track your order")}</h1><p className="muted mt-3 text-[15px]">{t("অর্ডারের সাথে পাওয়া ইউনিক আইডি (যেমন: ORD1024) লিখে বর্তমান অবস্থা দেখুন।", "Enter the unique order ID you received (e.g. ORD1024) to check its status.")}</p>
      <form onSubmit={submit} className="surface mt-9 p-7 text-left"><label htmlFor="track-id" className="label-bn">{t("অর্ডার আইডি", "Order ID")}</label><div className="flex flex-col gap-3 sm:flex-row"><input id="track-id" className="input-bn font-en uppercase tracking-wider" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ORD1024" required /><button className="btn-primary shrink-0" disabled={loading}>{loading ? t("খোঁজা হচ্ছে...", "Searching...") : t("অর্ডার খুঁজুন →", "Find order →")}</button></div>{error && <p role="alert" className="mt-3 text-[14px] font-semibold text-[#a73333]">⚠ {localizeError(error, language, t("ট্র্যাক করা যায়নি", "Could not find the order."))}</p>}</form>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">{[["📦", t("অর্ডার দিন", "Place an order"), t("অর্ডার দেওয়ার সাথে সাথেই আইডি পাবেন", "Get your order ID as soon as you order")], ["📞", t("কনফার্মেশন", "Confirmation"), t("আমাদের দল ফোন করে অর্ডার কনফার্ম করে", "Our team calls to confirm your order")], ["🚚", t("ডেলিভারি", "Delivery"), t("পণ্য পৌঁছালে ক্যাশ দিয়ে নিন", "Pay in cash when your order arrives")]].map(([icon, title, text]) => <div key={title} className="surface p-5"><div className="text-3xl">{icon}</div><h3 className="mt-3 font-bold">{title}</h3><p className="muted mt-1 text-[13px] leading-6">{text}</p></div>)}</div>
    </div></div>
  );
}
