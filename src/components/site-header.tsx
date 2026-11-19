"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CART_EVENT, fetchCart } from "@/lib/client";
import { useLanguage } from "./language-provider";

export default function SiteHeader() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language, setLanguage, t, number } = useLanguage();

  const publicLinks = [
    { href: "/", label: t("হোম", "Home") },
    { href: "/products", label: t("পণ্য", "Shop") },
    { href: "/track", label: t("অর্ডার ট্র্যাক", "Track order") },
  ];
  const links = isAdmin
    ? [...publicLinks, { href: "/admin", label: t("ড্যাশবোর্ড", "Dashboard") }]
    : publicLinks;

  useEffect(() => {
    const load = () => {
      fetchCart().then((cart) => setCount(cart.count)).catch(() => undefined);
    };
    load();
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, [pathname]);

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
    <header className="sticky top-0 z-50 border-b border-[#e7e3d8] bg-[#faf7f0]/95 backdrop-blur-md">
      <div className="container-bn flex h-[70px] items-center justify-between gap-1 sm:gap-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#14563d] text-xl text-white shadow-md sm:h-10 sm:w-10">❋</span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[14px] font-bold text-[#0c3929] sm:text-[19px]">{t("বাংলা বাজার", "Bangla Bazar")}</span>
            <span className="hidden whitespace-nowrap text-[9px] font-bold tracking-[.08em] text-[#d99a38] min-[380px]:block sm:tracking-[.16em]">{t("ক্যাশ অন ডেলিভারি", "CASH ON DELIVERY")}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("প্রধান মেনু", "Main navigation")}>
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const adminLink = link.href === "/admin";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[15px] font-semibold transition ${
                  adminLink
                    ? "bg-[#14563d] text-white hover:bg-[#0c3929]"
                    : active
                      ? "bg-[#e6f0e9] text-[#14563d]"
                      : "text-[#4b5c51] hover:text-[#14563d]"
                }`}
              >
                {adminLink && <span aria-hidden>📊</span>}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            aria-label={language === "bn" ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
            title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#c7d9cc] bg-[#eef5ef] px-2.5 text-[13px] font-bold text-[#14563d] transition hover:border-[#14563d] hover:bg-[#e2efe5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14563d] sm:h-11 sm:px-3.5"
          >
            <svg aria-hidden="true" className="hidden min-[380px]:block" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9S9.6 5.5 12 3Z" /></svg>
            {language === "bn" ? <><span className="sm:hidden">EN</span><span className="hidden sm:inline">English</span></> : <span>বাংলা</span>}
          </button>
          <Link href="/cart" aria-label={t("কার্ট দেখুন", "View cart")} className="relative flex h-10 items-center gap-2 rounded-xl border border-[#e2ded3] bg-white px-2.5 text-sm font-semibold transition hover:border-[#14563d] sm:h-11 sm:px-3.5">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M2 3h2.2l2.2 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.4" /></svg>
            <span className="hidden sm:inline">{t("কার্ট", "Cart")}</span>
            {count > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d99a38] px-1 text-[11px] font-bold text-white">{number(count)}</span>}
          </Link>
          <button type="button" aria-label={t("মেনু", "Menu")} aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2ded3] bg-white sm:h-11 sm:w-11 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-[#e7e3d8] bg-white px-5 py-3 lg:hidden" aria-label={t("মোবাইল মেনু", "Mobile navigation")}>
          {links.map((link) => {
            const adminLink = link.href === "/admin";
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-[15px] font-semibold transition ${
                  adminLink
                    ? "mt-1 bg-[#14563d] text-white"
                    : active
                      ? "bg-[#eef5f0] text-[#14563d]"
                      : "text-[#415347] hover:bg-[#eef5f0]"
                }`}
              >
                {adminLink ? `📊 ${link.label}` : link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
