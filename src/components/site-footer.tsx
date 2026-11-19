"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

export default function SiteFooter() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const year = new Date().getFullYear().toLocaleString(language === "en" ? "en-BD" : "bn-BD", { useGrouping: false });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <footer className="mt-20 bg-[#0c3929] text-white/75">
      <div className="container-bn grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">❋</span><span className="text-xl font-bold">{t("বাংলা বাজার", "Bangla Bazar")}</span></div>
          <p className="mt-4 max-w-md text-[15px] leading-7">{t("সত্যি দাম, সত্যি পণ্য এবং নির্ভরযোগ্য ক্যাশ অন ডেলিভারি—সারা বাংলাদেশে আপনার দরজায় পৌঁছে দিচ্ছি আপনার পছন্দের পণ্য।", "Honest prices, quality products, and reliable cash on delivery—bringing your favourites to your door across Bangladesh.")}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[13px]"><span className="rounded-lg bg-white/10 px-3 py-1.5">✔ {t("ক্যাশ অন ডেলিভারি", "Cash on delivery")}</span><span className="rounded-lg bg-white/10 px-3 py-1.5">✔ {t("৭ দিন রিটার্ন", "7-day returns")}</span></div>
        </div>
        <div>
          <h4 className="mb-4 text-[16px] font-bold text-white">{t("দ্রুত লিংক", "Quick links")}</h4>
          <div className="space-y-2.5 text-[15px]">
            <Link href="/products" className="block hover:text-white">{t("সকল পণ্য", "All products")}</Link>
            <Link href="/track" className="block hover:text-white">{t("অর্ডার ট্র্যাক করুন", "Track your order")}</Link>
            <Link href="/cart" className="block hover:text-white">{t("আমার কার্ট", "My cart")}</Link>
            {isAdmin && (
              <Link href="/admin" className="block font-bold text-[#ffd98a] hover:text-white">📊 {t("অ্যাডমিন ড্যাশবোর্ড", "Admin dashboard")}</Link>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-[16px] font-bold text-white">{t("যোগাযোগ", "Get in touch")}</h4>
          <div className="space-y-2.5 text-[15px]"><p>📞 {t("০১৩২৪-৫৬৭৮৯০", "01324-567890")}</p><p className="break-all">✉ hello@bangabazar.com.bd</p><p>📍 {t("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</p><p className="pt-2 text-[13px] text-white/50">{t("সকাল ৯টা — রাত ৯টা", "9 AM — 9 PM")}</p></div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[13px]">© {year} {t("বাংলা বাজার। সকল অধিকার সংরক্ষিত।", "Bangla Bazar. All rights reserved.")}</div>
    </footer>
  );
}
