"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Product } from "@/db/schema";
import { badgeName, categoryName, productDescription, productName } from "@/lib/i18n";
import AddToCartButton from "./add-to-cart-button";
import ProductCard from "./product-card";
import { useLanguage } from "./language-provider";

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const { language, t, money, number } = useLanguage();
  const name = productName(product, language);
  const price = product.discountPrice ?? product.price;
  return (
    <div className="container-bn py-10">
      <nav className="mb-6 flex items-center gap-2 text-[13px] text-[#859087]"><Link href="/" className="hover:text-[#14563d]">{t("হোম", "Home")}</Link><span>/</span><Link href="/products" className="hover:text-[#14563d]">{t("পণ্য", "Shop")}</Link><span>/</span><span className="text-[#14563d]">{name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="surface overflow-hidden p-4"><img src={product.imageUrl} alt={name} className="aspect-square w-full rounded-xl object-cover" /></div>
        <div>
          {product.badge && <span className="rounded-lg bg-[#e6f0e9] px-3 py-1 text-[13px] font-bold text-[#14563d]">{badgeName(product.badge, language, product.badgeEn)}</span>}
          <h1 className="mt-4 text-[32px] font-bold leading-tight text-[#0c3929] sm:text-[40px]">{name}</h1>
          <p className="mt-2 text-[14px] text-[#87928a]">{t("ক্যাটাগরি", "Category")}: {categoryName(product.category, language, product.categoryEn)}</p>
          <div className="mt-6 flex items-end gap-3"><span className="text-[34px] font-bold text-[#14563d]">{money(price)}</span>{product.discountPrice && <span className="mb-1.5 text-[18px] text-[#a7afa8] line-through">{money(product.price)}</span>}</div>
          <p className="mt-6 text-[16px] leading-8 text-[#5d6d62]">{productDescription(product, language)}</p>
          <div className="mt-7 rounded-2xl border border-[#e7e3d8] bg-white p-5">
            <div className="flex items-center justify-between text-[15px]"><span className="text-[#6c7a70]">{t("স্টক অবস্থা", "Availability")}</span><span className={product.stock > 0 ? "font-bold text-[#1a7139]" : "font-bold text-[#a73333]"}>{product.stock > 0 ? t(`✓ ${number(product.stock)} টি পণ্য স্টকে আছে`, `✓ ${number(product.stock)} in stock`) : t("স্টক নেই", "Out of stock")}</span></div>
            <div className="mt-5"><AddToCartButton productId={product.id} stock={product.stock} label={t("এখনই কার্টে যোগ করুন", "Add to cart now")} /></div>
            <Link href="/cart" className="btn-ghost mt-3 w-full">{t("কার্টে যান", "View cart")} →</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-[13px] font-semibold text-[#4b5c51]"><div className="rounded-xl bg-[#eef5f0] p-3.5">🚚 {t("দ্রুত ডেলিভারি", "Fast delivery")}</div><div className="rounded-xl bg-[#fbf2e4] p-3.5">💵 {t("ক্যাশ অন ডেলিভারি", "Cash on delivery")}</div><div className="rounded-xl bg-[#eef5f0] p-3.5">🛡️ {t("নিরাপদ অর্ডার", "Secure ordering")}</div><div className="rounded-xl bg-[#fbf2e4] p-3.5">↩️ {t("৭ দিন রিটার্ন", "7-day returns")}</div></div>
        </div>
      </div>
      {related.length > 0 && <section className="mt-20"><h2 className="section-title mb-7">{t("একই ক্যাটাগরির অন্যান্য পণ্য", "More from this category")}</h2><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </div>
  );
}
