"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Product } from "@/db/schema";
import ProductCard from "./product-card";
import { useLanguage } from "./language-provider";

export default function HomeContent({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  const steps = [
    { n: t("০১", "01"), title: t("পণ্য বাছুন", "Pick your favourites"), text: t("আপনার পছন্দের পণ্য দেখে কার্টে যোগ করুন। দাম ও স্টক সব কিছু আগেই দেখতে পাবেন।", "Explore our collection, check prices and stock, and add your favourites to your cart."), icon: "🛍️" },
    { n: t("০২", "02"), title: t("ঠিকানা দিন", "Enter your address"), text: t("চেকআউটে নাম, ফোন ও সম্পূর্ণ ডেলিভারি ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।", "Enter your name, phone number and delivery address at checkout to place your order."), icon: "📍" },
    { n: t("০৩", "03"), title: t("ক্যাশ দিয়ে নিন", "Pay on delivery"), text: t("অর্ডার কনফার্ম হলে পণ্য হাতে পেয়ে ক্যাশ দিন। কোনো অগ্রিম পেমেন্ট নেই।", "Pay in cash when your order arrives at your doorstep. No advance payment needed."), icon: "💵" },
  ];
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#e9e4d8] bg-[radial-gradient(circle_at_12%_20%,#eef5ed,transparent_45%),radial-gradient(circle_at_85%_80%,#f7ecd8,transparent_40%)]">
        <div className="container-bn grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div className="pop-in">
            <span className="eyebrow">── {t("স্বাগতম বাংলা বাজারে", "Welcome to Bangla Bazar")}</span>
            <h1 className="mt-4 text-[40px] font-bold leading-[1.2] text-[#0c3929] sm:text-[54px]">
              {t("মানসম্মত পণ্য,", "Quality finds,")}<br />
              <span className="text-[#d99a38]">{t("ক্যাশ অন ডেলিভারি", "cash on delivery")}</span><br />
              {t("আপনার দরজায়।", "to your door.")}
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-8 text-[#5d6d62]">{t("ঢাকার ভেতরে মাত্র ৬০ টাকা, বাইরে ১২০ টাকা ডেলিভারি চার্জে আপনার পছন্দের পণ্য কিনুন। অর্ডার দেওয়ার পরেই পাবেন ট্র্যাকিং আইডি।", "Shop your favourites with delivery for just ৳60 inside Dhaka and ৳120 outside Dhaka. Get a tracking ID as soon as you order.")}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="btn-primary !px-7 !py-3.5 !text-[16px]">{t("কেনাকাটা শুরু করুন", "Start shopping")} <span aria-hidden>→</span></Link><Link href="/track" className="btn-ghost !px-7 !py-3.5 !text-[16px]">{t("অর্ডার ট্র্যাক করুন", "Track your order")}</Link></div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[14px] font-semibold text-[#4b5c51]"><span>✓ {t("১০০% অরিজিনাল পণ্য", "100% original products")}</span><span>✓ {t("৭ দিন রিটার্ন", "7-day returns")}</span><span>✓ {t("নিরাপদ COD", "Secure COD")}</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-[#dcecdf] blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="float-soft overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_24px_50px_rgba(12,57,41,.16)]"><img src="/images/panjabi.jpg" alt={t("পাঞ্জাবি", "Cotton panjabi")} className="h-[280px] w-full object-cover" /></div>
              <div className="mt-12 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_24px_50px_rgba(12,57,41,.16)]"><img src="/images/headphones.jpg" alt={t("হেডফোন", "Wireless headphones")} className="h-[240px] w-full object-cover" /></div>
            </div>
            <div className="float-soft absolute -bottom-5 left-3 rounded-2xl bg-white px-5 py-3 shadow-[0_14px_35px_rgba(12,57,41,.18)]"><p className="font-en text-[22px] font-extrabold text-[#14563d]">10k+</p><p className="text-[13px] text-[#7a877e]">{t("সন্তুষ্ট ক্রেতা", "happy customers")}</p></div>
            <div className="absolute -right-3 top-6 rotate-6 rounded-xl bg-[#d99a38] px-4 py-2.5 text-[13px] font-bold text-white shadow-lg">{t("ডিসকাউন্ট", "Great deals")} 🔥</div>
          </div>
        </div>
      </section>
      <section className="border-b border-[#e7e3d8] bg-white">
        <div className="container-bn grid grid-cols-2 divide-x divide-[#eeeae0] py-6 md:grid-cols-4">
          {[
            ["🚚", t("দ্রুত ডেলিভারি", "Fast delivery"), t("২৪-৪৮ ঘণ্টার মধ্যে", "Within 24–48 hours")],
            ["💵", t("ক্যাশ অন ডেলিভারি", "Cash on delivery"), t("কোনো অগ্রিম পেমেন্ট নেই", "No advance payment")],
            ["🛡️", t("নির্ভরযোগ্য সেবা", "Reliable service"), t("প্রতিটি অর্ডার যাচাই করা হয়", "Every order is checked")],
            ["↩️", t("সহজ রিটার্ন", "Easy returns"), t("৭ দিনের গ্যারান্টি", "7-day guarantee")],
          ].map(([icon, title, sub]) => <div key={title} className="flex items-center gap-3 px-3 py-2"><span className="text-2xl">{icon}</span><div><p className="text-[14px] font-bold">{title}</p><p className="text-[12px] text-[#859087]">{sub}</p></div></div>)}
        </div>
      </section>
      <section className="container-bn py-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">── {t("আমাদের সংগ্রহ", "Our collection")}</span><h2 className="section-title mt-2">{t("জনপ্রিয় পণ্যসমূহ", "Popular picks")}</h2><p className="muted mt-2 text-[15px]">{t("আপনার জন্য বেছে নেওয়া সেরা সেরা পণ্য", "Thoughtfully chosen products, just for you.")}</p></div><Link href="/products" className="btn-ghost">{t("সব পণ্য দেখুন", "View all products")} →</Link></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
      <section className="bg-white py-16">
        <div className="container-bn"><div className="text-center"><span className="eyebrow justify-center">── {t("সহজ তিন ধাপ", "Three simple steps")}</span><h2 className="section-title mt-2">{t("কীভাবে অর্ডার করবেন?", "How to place an order")}</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map((step) => <div key={step.n} className="surface relative p-7 text-center"><span className="absolute right-5 top-3 text-[42px] font-extrabold text-[#f0ece2]">{step.n}</span><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3ec] text-2xl">{step.icon}</div><h3 className="mt-4 text-[19px] font-bold text-[#0c3929]">{step.title}</h3><p className="muted mt-2 text-[14px] leading-7">{step.text}</p></div>)}</div>
        </div>
      </section>
      <section className="container-bn py-16"><div className="relative overflow-hidden rounded-3xl bg-[#14563d] px-8 py-12 text-center text-white sm:px-14"><div className="absolute -left-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" /><div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full border-[35px] border-white/5" /><div className="relative"><h2 className="text-[30px] font-bold sm:text-[38px]">{t("আপনার অর্ডার কোথায়? জানতে চান?", "Wondering where your order is?")}</h2><p className="mx-auto mt-3 max-w-xl text-[16px] text-white/75">{t("ইউনিক অর্ডার আইডি ব্যবহার করে যেকোনো সময় অর্ডারের বর্তমান অবস্থা দেখুন।", "Use your unique order ID to check your order status at any time.")}</p><Link href="/track" className="btn-gold mt-6">{t("অর্ডার ট্র্যাক করুন", "Track your order")} →</Link></div></div></section>
    </>
  );
}
